const pool = require("../util/connection");
const { logError } = require("../util/logError");

const getList = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.execute("SELECT * FROM brand");
        res.json({ list: rows });
    } catch (error) {
        logError("brand.controller.js", `Error getting brand list: ${error.message}`, res);
    } finally {
        if (connection) connection.release();
    }
};

const create = async (req, res) => {
    let connection;
    try {
        const { label, country, note } = req.body;
        if (!label || !country) {
            return res.status(400).json({ error: "Brand Name and Country are required." });
        }
        connection = await pool.getConnection();
        const [result] = await connection.execute(
            "INSERT INTO brand (label, country, note) VALUES (?, ?, ?)",
            [label, country, note || null]
        );
        res.json({ message: "Brand created successfully!", id: result.insertId });
    } catch (error) {
        logError("brand.controller.js", `Error creating brand: ${error.message}`, res);
    } finally {
        if (connection) connection.release();
    }
};

const update = async (req, res) => {
    let connection;
    try {
        const { id, label, country, note } = req.body;
        if (!id || !label || !country) {
            return res.status(400).json({ error: "ID, Brand Name, and Country are required." });
        }
        connection = await pool.getConnection();
        const [result] = await connection.execute(
            "UPDATE brand SET label = ?, country = ?, note = ? WHERE id = ?",
            [label, country, note || null, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Brand not found." });
        }
        res.json({ message: "Brand updated successfully!" });
    } catch (error) {
        logError("brand.controller.js", `Error updating brand: ${error.message}`, res);
    } finally {
        if (connection) connection.release();
    }
};

const remove = async (req, res) => {
    let connection;
    try {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ error: "ID is required." });
        }
        connection = await pool.getConnection();
        const [result] = await connection.execute("DELETE FROM brand WHERE id = ?", [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Brand not found." });
        }
        res.json({ message: "Brand deleted successfully!" });
    } catch (error) {
        logError("brand.controller.js", `Error deleting brand: ${error.message}`, res);
    } finally {
        if (connection) connection.release();
    }
};

module.exports = {
    getList,
    create,
    update,
    remove,
}; 