const { db, logError } = require("../util/helper");

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
                "INSERT INTO orders (order_number, customer_id, total_amount, payment_method, payment_amount, change_amount, status, create_by, currency, exchange_rate_to_usd) VALUES (?, ?, ?, ?, ?, ?, 'completed', ?, ?, ?)",
                [orderNumber, customer_id, total_amount, payment_method, payment_amount, change_amount, req.auth?.name, currency, exchange_rate_to_usd]
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
                SELECT o.*, c.name as customer_name
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