const {db, logError} = require("../util/helper");

exports.getList = async (req, res) => {
    try {
        const sql = `
            SELECT 
                po.*,
                s.name as supplier_name,
                u.name as created_by_name
            FROM purchase_order po
            LEFT JOIN supplier s ON po.supplier_id = s.id
            LEFT JOIN user u ON po.create_by = u.id
            ORDER BY po.id DESC
        `;
        const [list] = await db.query(sql);
        
        // Get items for each order
        for (let order of list) {
            const [items] = await db.query(`
                SELECT 
                    poi.*,
                    p.name as product_name,
                    p.barcode
                FROM purchase_order_item poi
                LEFT JOIN product p ON poi.product_id = p.id
                WHERE poi.purchase_order_id = ?
            `, [order.id]);
            order.items = items;
        }

        res.json({
            list: list
        });
    } catch (error) {
        logError("purchase.getList", error, res);
    }
};

exports.create = async (req, res) => {
    try {
        const { supplier_id, order_date, expected_delivery_date, notes, items, total_amount } = req.body;

        // Generate order number
        const [orderNumber] = await db.query(
            "SELECT CONCAT('PO', DATE_FORMAT(NOW(), '%Y%m%d'), LPAD(COALESCE(MAX(id), 0) + 1, 4, '0')) as order_number FROM purchase_order"
        );

        // Insert purchase order
        const [order] = await db.query(
            `INSERT INTO purchase_order (
                order_number, supplier_id, order_date, expected_delivery_date, 
                notes, total_amount, status, create_by
            ) VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)`,
            [
                orderNumber[0].order_number,
                supplier_id,
                order_date,
                expected_delivery_date,
                notes,
                total_amount,
                req.auth?.name
            ]
        );

        // Insert order items
        for (let item of items) {
            await db.query(
                `INSERT INTO purchase_order_item (
                    purchase_order_id, product_id, quantity, price
                ) VALUES (?, ?, ?, ?)`,
                [order.insertId, item.product_id, item.quantity, item.price]
            );
        }

        res.json({
            message: "Purchase order created successfully",
            data: {
                id: order.insertId,
                order_number: orderNumber[0].order_number
            }
        });
    } catch (error) {
        logError("purchase.create", error, res);
    }
};

exports.update = async (req, res) => {
    try {
        const { id, supplier_id, order_date, expected_delivery_date, notes, items, total_amount, status } = req.body;

        // Get the current order status
        const [currentOrder] = await db.query(
            "SELECT status FROM purchase_order WHERE id = ?",
            [id]
        );

        // Update purchase order
        const [result] = await db.query(
            `UPDATE purchase_order SET 
                supplier_id = ?,
                order_date = ?,
                expected_delivery_date = ?,
                notes = ?,
                total_amount = ?,
                status = ?
            WHERE id = ?`,
            [
                supplier_id,
                order_date,
                expected_delivery_date,
                notes,
                total_amount,
                status || 'pending',
                id
            ]
        );

        // If status is changing to 'received', update product quantities
        if (status === 'received' && currentOrder[0].status !== 'received') {
            // Get order items
            const [orderItems] = await db.query(
                `SELECT product_id, quantity FROM purchase_order_item WHERE purchase_order_id = ?`,
                [id]
            );

            // Update product quantities
            for (let item of orderItems) {
                await db.query(
                    `UPDATE product SET qty = qty + ? WHERE id = ?`,
                    [item.quantity, item.product_id]
                );
            }
        }

        // Delete existing items
        await db.query("DELETE FROM purchase_order_item WHERE purchase_order_id = ?", [id]);

        // Insert new items
        for (let item of items) {
            await db.query(
                `INSERT INTO purchase_order_item (
                    purchase_order_id, product_id, quantity, price
                ) VALUES (?, ?, ?, ?)`,
                [id, item.product_id, item.quantity, item.price]
            );
        }

        res.json({
            message: "Purchase order updated successfully",
            data: {
                id,
                status: status || 'pending'
            }
        });
    } catch (error) {
        logError("purchase.update", error, res);
    }
};

exports.remove = async (req, res) => {
    try {
        const { id } = req.body;

        // Delete order items first
        await db.query("DELETE FROM purchase_order_item WHERE purchase_order_id = ?", [id]);

        // Delete the order
        await db.query("DELETE FROM purchase_order WHERE id = ?", [id]);

        res.json({
            message: "Purchase order deleted successfully"
        });
    } catch (error) {
        logError("purchase.remove", error, res);
    }
}; 