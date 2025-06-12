const { db, logError } = require("../util/helper");

exports.getList = async (req, res) => {
    try {
        const [list] = await db.query("SELECT * FROM customer ORDER BY id DESC");
        res.json({
            list: list
        });
    } catch (error) {
        logError("customer.getList", error, res);
    }
};

exports.create = async (req, res) => {
    try {
        const { name, tel, email, address } = req.body;
        const [result] = await db.query(
            "INSERT INTO customer (name, tel, email, address, create_by) VALUES (?, ?, ?, ?, ?)",
            [name, tel, email, address, req.auth?.name]
        );
        res.json({
            message: "Customer created successfully",
            data: result
        });
    } catch (error) {
        logError("customer.create", error, res);
    }
};

exports.update = async (req, res) => {
    try {
        const { id, name, tel, email, address } = req.body;
        const [result] = await db.query(
            "UPDATE customer SET name = ?, tel = ?, email = ?, address = ? WHERE id = ?",
            [name, tel, email, address, id]
        );
        res.json({
            message: "Customer updated successfully",
            data: result
        });
    } catch (error) {
        logError("customer.update", error, res);
    }
};

exports.remove = async (req, res) => {
    try {
        const { id } = req.query;
        const [result] = await db.query("DELETE FROM customer WHERE id = ?", [id]);
        res.json({
            message: "Customer deleted successfully",
            data: result
        });
    } catch (error) {
        logError("customer.remove", error, res);
    }
}; 