const { db, logError } = require("../util/helper");
const { sendTelegramMessage } = require("../util/telegram");
const dayjs = require('dayjs');

exports.create = async (req, res) => {
    try {
        const { customer_id, items, total_amount, payment_method, payment_amount, change_amount, currency, exchange_rate_to_usd } = req.body;

        // Start transaction
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            // Generate order number
            const [orderNumberResult] = await connection.query(
                "SELECT CONCAT('ORD', DATE_FORMAT(NOW(), '%Y%m%d'), LPAD((SELECT COALESCE(MAX(id), 0) + 1 FROM orders), 4, '0')) as order_number"
            );
            const orderNumber = orderNumberResult[0].order_number;

            // Create order
            const [orderResult] = await connection.query(
                "INSERT INTO orders (order_number, customer_id, total_amount, payment_method, payment_amount, change_amount, status, create_by, currency, exchange_rate_to_usd, discount) VALUES (?, ?, ?, ?, ?, ?, 'completed', ?, ?, ?, ?)",
                [orderNumber, customer_id, total_amount, payment_method, payment_amount, change_amount, req.auth?.name, currency, exchange_rate_to_usd, req.body.discount || 0]
            );

            const orderId = orderResult.insertId;

            // Insert order items and update product quantities
            for (const item of items) {
                // Insert order item
                await connection.query(
                    "INSERT INTO order_items (order_id, product_id, quantity, price, discount) VALUES (?, ?, ?, ?, ?)",
                    [orderId, item.product_id, item.quantity, item.price, item.discount || 0]
                );

                // Update product quantity
                await connection.query(
                    "UPDATE product SET qty = qty - ? WHERE id = ?",
                    [item.quantity, item.product_id]
                );
            }

            // Commit transaction
            await connection.commit();

            // Get the created order with items
            const [order] = await connection.query(`
                SELECT o.*, c.name as customer_name, c.tel as customer_phone, c.email as customer_email
                FROM orders o
                LEFT JOIN customer c ON o.customer_id = c.id
                WHERE o.id = ?
            `, [orderId]);

            const [orderItems] = await connection.query(`
                SELECT oi.*, p.name as product_name, p.barcode, p.brand, c.Name as category_name
                FROM order_items oi
                LEFT JOIN product p ON oi.product_id = p.id
                LEFT JOIN category c ON p.category_id = c.Id
                WHERE oi.order_id = ?
            `, [orderId]);

            // Calculate totals
            const subtotal = orderItems.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
            const totalDiscount = orderItems.reduce((sum, item) => sum + ((Number(item.price) * Number(item.quantity)) * (Number(item.discount || 0) / 100)), 0);
            const totalItems = orderItems.reduce((sum, item) => sum + Number(item.quantity), 0);

            // Send Telegram notification with detailed information
            const customerName = order[0].customer_name || 'Walk-in Customer';
            const customerPhone = order[0].customer_phone || 'N/A';
            const customerEmail = order[0].customer_email || 'N/A';
            const currentTime = new Date().toLocaleString();
            const paymentMethodEmoji = {
                'cash': '💵',
                'card': '💳',
                'bank': '🏦'
            }[payment_method] || '💰';

            const message = `
<b>🛍 NEW ORDER COMPLETED!</b>

<b>📋 Order Information:</b>
Order Number: <b>${orderNumber}</b>
Date & Time: ${currentTime}
Status: ✅ Completed

<b>👤 Customer Details:</b>
Name: ${customerName}
Phone: ${customerPhone}
Email: ${customerEmail}

<b>💳 Payment Information:</b>
Method: ${paymentMethodEmoji} ${payment_method.toUpperCase()}
Total Amount: ${currency} ${total_amount.toFixed(2)}
Amount Paid: ${currency} ${payment_amount.toFixed(2)}

<b>📦 Order Summary:</b>
Total Items: ${totalItems}
Subtotal: ${currency} ${subtotal.toFixed(2)}
Discount: ${currency} ${Number(order[0].discount || 0).toFixed(2)}
Final Total: ${currency} ${Number(total_amount).toFixed(2)}

<b>🛒 Items Purchased:</b>
${orderItems.map((item, index) => `
${index + 1}. ${item.product_name} (Qty: ${Number(item.quantity)}) - ${currency} ${((Number(item.price) * Number(item.quantity)) - ((Number(item.price) * Number(item.quantity)) * (Number(item.discount || 0) / 100))).toFixed(2)}
`).join('')}

<b>👨‍💼 Processed by:</b> ${req.auth?.name}

<b>💱 Exchange Rate:</b> 1 ${currency} = ${Number(exchange_rate_to_usd).toFixed(4)} USD

Thank you for your business! 🎉
            `;

            await sendTelegramMessage(message);

            // Low stock alert after order completion
            const lowStockThreshold = 10; // You can adjust this value
            for (const item of items) {
                // Get the updated product info
                const [productRows] = await db.query(
                    "SELECT name, barcode, qty FROM product WHERE id = ?",
                    [item.product_id]
                );
                const product = productRows[0];
                if (product && product.qty <= lowStockThreshold) {
                    await sendTelegramMessage(
                        `⚠️ <b>Low Stock Alert</b>\n` +
                        `Product: <b>${product.name}</b>\n` +
                        `Barcode: <b>${product.barcode}</b>\n` +
                        `Current Stock: <b>${product.qty}</b>`
                    );
                }
            }

            res.json({
                message: "Order created successfully",
                data: {
                    order_number: orderNumber,
                    order: {
                        ...order[0],
                        items: orderItems
                    }
                }
            });

        } catch (error) {
            // Rollback transaction on error
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }

    } catch (error) {
        await logError("order.create", error);
        res.status(500).json({
            error: "Failed to create order",
            details: error.message
        });
    }
};

exports.getList = async (req, res) => {
    try {
        const [orders] = await db.query(`
            SELECT o.*, c.name as customer_name,
                DATE_FORMAT(o.created_at, '%Y-%m-%d %H:%i:%s') as created_at,
                o.currency, o.exchange_rate_to_usd
            FROM orders o
            LEFT JOIN customer c ON o.customer_id = c.id
            ORDER BY o.id DESC
        `);

        // Get items for each order
        for (let order of orders) {
            const [items] = await db.query(`
                SELECT oi.*, p.name as product_name, p.barcode, p.brand, c.Name as category_name
                FROM order_items oi
                LEFT JOIN product p ON oi.product_id = p.id
                LEFT JOIN category c ON p.category_id = c.Id
                WHERE oi.order_id = ?
            `, [order.id]);
            order.items = items;
        }

        res.json({
            list: orders
        });
    } catch (error) {
        await logError("order.getList", error);
        res.status(500).json({
            error: "Failed to fetch orders",
            details: error.message
        });
    }
};

// Helper function to format currency
const formatCurrency = (amount, currency) => {
    if (isNaN(amount)) return '0.00';
    return Number(amount).toFixed(2);
};

// Helper function to get currency symbol
const getCurrencySymbol = (currency) => {
    switch (currency) {
        case 'USD': return '$';
        case 'EUR': return '€';
        case 'GBP': return '£';
        case 'JPY': return '¥';
        case 'AUD': return 'A$';
        case 'CAD': return 'C$';
        case 'CHF': return 'CHF';
        case 'CNY': return '¥';
        case 'SEK': return 'kr';
        case 'NZD': return 'NZ$';
        case 'SGD': return 'S$';
        case 'HKD': return 'HK$';
        case 'KHR': return '៛';
        default: return '$';
    }
};

// Generate daily report
const generateDailyReport = async () => {
    try {
        const today = dayjs().format('YYYY-MM-DD');
        const [orders] = await db.query(`
            SELECT 
                o.*,
                COUNT(DISTINCT o.id) as total_orders,
                SUM(o.total_amount) as total_sales,
                SUM(o.discount) as total_discount,
                COUNT(DISTINCT o.customer_id) as total_customers
            FROM orders o
            WHERE DATE(o.created_at) = ?
            GROUP BY DATE(o.created_at)
        `, [today]);

        if (orders.length > 0) {
            const report = orders[0];
            const message = `
📊 <b>DAILY SALES REPORT</b>
📅 Date: ${dayjs(today).format('MMMM D, YYYY')}

💰 <b>Sales Summary:</b>
• Total Orders: ${report.total_orders}
• Total Sales: ${getCurrencySymbol(report.currency)}${formatCurrency(report.total_sales)}
• Total Discount: ${getCurrencySymbol(report.currency)}${formatCurrency(report.total_discount)}
• Total Customers: ${report.total_customers}

📈 <b>Top Selling Products:</b>
${await getTopSellingProducts(today)}

🔄 <b>Payment Methods:</b>
${await getPaymentMethodsSummary(today)}
            `;
            await sendTelegramMessage(message);
        }
    } catch (error) {
        await logError("order.generateDailyReport", error);
    }
};

// Generate weekly report
const generateWeeklyReport = async () => {
    try {
        const startOfWeek = dayjs().startOf('week').format('YYYY-MM-DD');
        const endOfWeek = dayjs().endOf('week').format('YYYY-MM-DD');
        
        const [orders] = await db.query(`
            SELECT 
                DATE(o.created_at) as date,
                COUNT(DISTINCT o.id) as total_orders,
                SUM(o.total_amount) as total_sales,
                SUM(o.discount) as total_discount,
                COUNT(DISTINCT o.customer_id) as total_customers
            FROM orders o
            WHERE DATE(o.created_at) BETWEEN ? AND ?
            GROUP BY DATE(o.created_at)
            ORDER BY date
        `, [startOfWeek, endOfWeek]);

        if (orders.length > 0) {
            const totalSales = orders.reduce((sum, order) => sum + Number(order.total_sales), 0);
            const totalOrders = orders.reduce((sum, order) => sum + Number(order.total_orders), 0);
            const totalDiscount = orders.reduce((sum, order) => sum + Number(order.total_discount), 0);
            const totalCustomers = orders.reduce((sum, order) => sum + Number(order.total_customers), 0);

            const message = `
📊 <b>WEEKLY SALES REPORT</b>
📅 Period: ${dayjs(startOfWeek).format('MMM D')} - ${dayjs(endOfWeek).format('MMM D, YYYY')}

💰 <b>Sales Summary:</b>
• Total Orders: ${totalOrders}
• Total Sales: ${getCurrencySymbol(orders[0].currency)}${formatCurrency(totalSales)}
• Total Discount: ${getCurrencySymbol(orders[0].currency)}${formatCurrency(totalDiscount)}
• Total Customers: ${totalCustomers}

📈 <b>Daily Breakdown:</b>
${orders.map(order => `
• ${dayjs(order.date).format('MMM D')}: ${getCurrencySymbol(order.currency)}${formatCurrency(order.total_sales)} (${order.total_orders} orders)
`).join('')}

📈 <b>Top Selling Products:</b>
${await getTopSellingProducts(startOfWeek, endOfWeek)}

🔄 <b>Payment Methods:</b>
${await getPaymentMethodsSummary(startOfWeek, endOfWeek)}
            `;
            await sendTelegramMessage(message);
        }
    } catch (error) {
        await logError("order.generateWeeklyReport", error);
    }
};

// Generate monthly report
const generateMonthlyReport = async () => {
    try {
        const startOfMonth = dayjs().startOf('month').format('YYYY-MM-DD');
        const endOfMonth = dayjs().endOf('month').format('YYYY-MM-DD');
        
        const [orders] = await db.query(`
            SELECT 
                DATE(o.created_at) as date,
                COUNT(DISTINCT o.id) as total_orders,
                SUM(o.total_amount) as total_sales,
                SUM(o.discount) as total_discount,
                COUNT(DISTINCT o.customer_id) as total_customers
            FROM orders o
            WHERE DATE(o.created_at) BETWEEN ? AND ?
            GROUP BY DATE(o.created_at)
            ORDER BY date
        `, [startOfMonth, endOfMonth]);

        if (orders.length > 0) {
            const totalSales = orders.reduce((sum, order) => sum + Number(order.total_sales), 0);
            const totalOrders = orders.reduce((sum, order) => sum + Number(order.total_orders), 0);
            const totalDiscount = orders.reduce((sum, order) => sum + Number(order.total_discount), 0);
            const totalCustomers = orders.reduce((sum, order) => sum + Number(order.total_customers), 0);

            const message = `
📊 <b>MONTHLY SALES REPORT</b>
📅 Month: ${dayjs(startOfMonth).format('MMMM YYYY')}

💰 <b>Sales Summary:</b>
• Total Orders: ${totalOrders}
• Total Sales: ${getCurrencySymbol(orders[0].currency)}${formatCurrency(totalSales)}
• Total Discount: ${getCurrencySymbol(orders[0].currency)}${formatCurrency(totalDiscount)}
• Total Customers: ${totalCustomers}
• Average Daily Sales: ${getCurrencySymbol(orders[0].currency)}${formatCurrency(totalSales / orders.length)}

📈 <b>Weekly Breakdown:</b>
${getWeeklyBreakdown(orders)}

📈 <b>Top Selling Products:</b>
${await getTopSellingProducts(startOfMonth, endOfMonth)}

🔄 <b>Payment Methods:</b>
${await getPaymentMethodsSummary(startOfMonth, endOfMonth)}
            `;
            await sendTelegramMessage(message);
        }
    } catch (error) {
        await logError("order.generateMonthlyReport", error);
    }
};

// Helper function to get top selling products
const getTopSellingProducts = async (startDate, endDate = null) => {
    try {
        const query = endDate 
            ? `SELECT p.name, SUM(oi.quantity) as total_quantity, SUM(oi.quantity * oi.price) as total_sales
               FROM order_items oi
               JOIN orders o ON oi.order_id = o.id
               JOIN product p ON oi.product_id = p.id
               WHERE DATE(o.created_at) BETWEEN ? AND ?
               GROUP BY p.id
               ORDER BY total_quantity DESC
               LIMIT 5`
            : `SELECT p.name, SUM(oi.quantity) as total_quantity, SUM(oi.quantity * oi.price) as total_sales
               FROM order_items oi
               JOIN orders o ON oi.order_id = o.id
               JOIN product p ON oi.product_id = p.id
               WHERE DATE(o.created_at) = ?
               GROUP BY p.id
               ORDER BY total_quantity DESC
               LIMIT 5`;

        const params = endDate ? [startDate, endDate] : [startDate];
        const [products] = await db.query(query, params);

        return products.map((product, index) => 
            `${index + 1}. ${product.name}: ${product.total_quantity} units (${getCurrencySymbol('USD')}${formatCurrency(product.total_sales)})`
        ).join('\n');
    } catch (error) {
        await logError("order.getTopSellingProducts", error);
        return "Error fetching top products";
    }
};

// Helper function to get payment methods summary
const getPaymentMethodsSummary = async (startDate, endDate = null) => {
    try {
        const query = endDate
            ? `SELECT payment_method, COUNT(*) as count, SUM(total_amount) as total
               FROM orders
               WHERE DATE(created_at) BETWEEN ? AND ?
               GROUP BY payment_method`
            : `SELECT payment_method, COUNT(*) as count, SUM(total_amount) as total
               FROM orders
               WHERE DATE(created_at) = ?
               GROUP BY payment_method`;

        const params = endDate ? [startDate, endDate] : [startDate];
        const [methods] = await db.query(query, params);

        return methods.map(method => 
            `• ${method.payment_method.toUpperCase()}: ${method.count} orders (${getCurrencySymbol('USD')}${formatCurrency(method.total)})`
        ).join('\n');
    } catch (error) {
        await logError("order.getPaymentMethodsSummary", error);
        return "Error fetching payment methods";
    }
};

// Helper function to get weekly breakdown
const getWeeklyBreakdown = (orders) => {
    const weeks = {};
    orders.forEach(order => {
        const week = dayjs(order.date).format('YYYY-[W]WW');
        if (!weeks[week]) {
            weeks[week] = {
                total_sales: 0,
                total_orders: 0
            };
        }
        weeks[week].total_sales += Number(order.total_sales);
        weeks[week].total_orders += Number(order.total_orders);
    });

    return Object.entries(weeks).map(([week, data]) => 
        `• Week ${week.split('W')[1]}: ${getCurrencySymbol('USD')}${formatCurrency(data.total_sales)} (${data.total_orders} orders)`
    ).join('\n');
};

// Schedule reports
const scheduleReports = () => {
    // Daily report at 11:59 PM
    setInterval(async () => {
        const now = new Date();
        if (now.getHours() === 23 && now.getMinutes() === 59) {
            await generateDailyReport();
        }
    }, 60000); // Check every minute

    // Weekly report on Sunday at 11:59 PM
    setInterval(async () => {
        const now = new Date();
        if (now.getDay() === 0 && now.getHours() === 23 && now.getMinutes() === 59) {
            await generateWeeklyReport();
        }
    }, 60000);

    // Monthly report on last day of month at 11:59 PM
    setInterval(async () => {
        const now = new Date();
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        if (now.getDate() === lastDay && now.getHours() === 23 && now.getMinutes() === 59) {
            await generateMonthlyReport();
        }
    }, 60000);
};

// Start scheduling reports when the server starts
scheduleReports(); 