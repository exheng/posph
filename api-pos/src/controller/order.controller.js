const { db, logError } = require("../util/helper");

exports.create = async (req, res) => {
    try {
        const { customer_id, items, total_amount, payment_method, payment_amount, change_amount } = req.body;

        // Start transaction
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            // Create order
            const [orderResult] = await connection.query(
                "INSERT INTO orders (customer_id, total_amount, payment_method, payment_amount, change_amount, status, create_by) VALUES (?, ?, ?, ?, ?, 'completed', ?)",
                [customer_id, total_amount, payment_method, payment_amount, change_amount, req.auth?.name]
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
                SELECT oi.*, p.name as product_name
                FROM order_items oi
                LEFT JOIN product p ON oi.product_id = p.id
                WHERE oi.order_id = ?
            `, [orderId]);

            res.json({
                message: "Order created successfully",
                order: {
                    ...order[0],
                    items: orderItems
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
        logError("order.create", error, res);
    }
};

exports.getList = async (req, res) => {
    try {
        const [orders] = await db.query(`
            SELECT o.*, c.name as customer_name
            FROM orders o
            LEFT JOIN customer c ON o.customer_id = c.id
            ORDER BY o.id DESC
        `);

        res.json({
            list: orders
        });
    } catch (error) {
        logError("order.getList", error, res);
    }
}; 