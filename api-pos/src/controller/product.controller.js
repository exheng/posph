const {db,isArray,isEmpty, logError} = require("../util/helper")
const { sendTelegramMessage } = require("../util/telegram");


exports.getList = async (req,res) => {
    try{
        const sql = `
            SELECT 
                p.*,
                c.Name as category_name,
                c.Description as category_description,
                b.label as brand_name
            FROM product p
            LEFT JOIN category c ON p.category_id = c.Id
            LEFT JOIN brand b ON p.brand = b.id
            ORDER BY p.id DESC
        `;
        const [list] = await db.query(sql);
        res.json({
            list: list,
        }); 
    } catch (error){
        await logError("product.getList", error);
        res.status(500).json({ error: "Failed to fetch products", details: error.message });
    } 
};

exports.create = async (req, res) => {
  try {
    if (await isExistBarcode(req.body.barcode)){
            res.json({
                error : {
                    barcode : "Barcode is already exist!"
                }
            });
            return false;
        }
    // SQL INSERT with named parameters
    const sql = "INSERT INTO product (category_id, barcode, name, brand, description, qty, price, discount, status, create_by, image) VALUES (:category_id, :barcode, :name, :brand, :description, :qty, :price, :discount, :status, :create_by, :image)";

    const [data] = await db.query(sql, {
      ...req.body,
      image: req.file?.filename,
      create_by : req.auth?.name,
    });

    res.json({
      data,
      message: "Insert Success!",
    });
  } catch (error) {
    await logError("product.create", error);
    res.status(500).json({ error: "Failed to create product", details: error.message });
  }
};


exports.update = async (req, res) => {
    try {
        if (await isExistBarcode(req.body.barcode, req.body.id)) {
            res.json({
                error: {
                    barcode: "Barcode is already exist!"
                }
            });
            return false;
        }

        const sql = `
            UPDATE product 
            SET category_id = :category_id,
                barcode = :barcode,
                name = :name,
                brand = :brand,
                description = :description,
                qty = :qty,
                price = :price,
                discount = :discount,
                status = :status,
                image = CASE 
                    WHEN :image IS NOT NULL THEN :image 
                    ELSE image 
                END
            WHERE id = :id
        `;

        const params = {
            id: req.body.id,
            category_id: req.body.category_id,
            barcode: req.body.barcode,
            name: req.body.name,
            brand: req.body.brand,
            description: req.body.description,
            qty: req.body.qty,
            price: req.body.price,
            discount: req.body.discount,
            status: req.body.status,
            image: req.file?.filename
        };

        const [data] = await db.query(sql, params);

        res.json({
            data,
            message: "Product updated successfully!"
        });
    } catch (error) {
        await logError("product.update", error);
        res.status(500).json({ error: "Failed to update product", details: error.message });
    }
};

exports.remove = async (req, res) => {
    try {
        const id = req.query.id;
        // Check for related order_items
        const [orderItems] = await db.query("SELECT COUNT(*) as count FROM order_items WHERE product_id = :id", { id });
        if (orderItems[0].count > 0) {
            return res.status(400).json({
                error: true,
                message: "Cannot delete this product because it is referenced in order items."
            });
        }
        const [data] = await db.query("DELETE FROM product WHERE id = :id", { id });
        res.json({
            data: data,
            message: "Product deleted successfully!"
        });
    } catch (error) {
        await logError("product.remove", error);
        res.status(500).json({ error: "Failed to remove product", details: error.message });
    }
};

exports.newBarcode = async (req,res) => {
   try{
        var sql = "SELECT CONCAT('P', LPAD((SELECT COALESCE(MAX(id), 0) + 1 FROM product), 3, '0')) AS barcode";
        var [data] = await db.query(sql);
        res.json({
        barcode: data[0].barcode, 
        message : "Data Delete Success!"
    }); 
    }catch(error){
        await logError("product.newBarcode", error);
        res.status(500).json({ error: "Failed to generate new barcode", details: error.message });
    }
}; 

isExistBarcode = async (barcode, currentId = null) => {
    try {
        let sql = "SELECT COUNT(id) AS Total FROM product WHERE barcode = :barcode";
        const params = { barcode: barcode };

        if (currentId) {
            sql += " AND id != :id";
            params.id = currentId;
        }

        const [data] = await db.query(sql, params);
        return data.length > 0 && data[0].Total > 0;
    } catch (error) {
        logError("product.isExistBarcode", error);
        return false;
    }
}; 

exports.alertAdmin = async (req, res) => {
    try {
        const { product_id, product_name, current_stock, threshold, category, brand, alerted_by } = req.body;
        
        // Create detailed alert message
        const alertMessage = `
🚨 <b>LOW STOCK ALERT FROM CASHIER</b>

<b>Product Details:</b>
Name: <b>${product_name}</b>
Category: ${category || 'N/A'}
Brand: ${brand || 'N/A'}
Current Stock: <b>${current_stock}</b>
Threshold: <b>${threshold}</b>

<b>Alert Information:</b>
Alerted by: <b>${alerted_by}</b>
Time: ${new Date().toLocaleString()}

<b>Action Required:</b>
Please create a purchase order to restock this product.

<b>Recommended Quantity:</b>
${threshold - current_stock} units needed to reach threshold
        `;

        // Send Telegram notification
        await sendTelegramMessage(alertMessage);

        // Log the alert in database (optional)
        const logSql = `
            INSERT INTO product_alerts (product_id, product_name, current_stock, threshold, alerted_by, alert_type, created_at) 
            VALUES (?, ?, ?, ?, ?, 'low_stock_cashier_alert', NOW())
        `;
        
        try {
            await db.query(logSql, [product_id, product_name, current_stock, threshold, alerted_by]);
        } catch (logError) {
            // Don't fail the request if logging fails
            console.error("Failed to log alert:", logError);
        }

        res.json({
            message: "Admin has been alerted successfully!",
            success: true
        });

    } catch (error) {
        await logError("product.alertAdmin", error);
        res.status(500).json({ 
            error: "Failed to alert admin", 
            details: error.message 
        });
    }
}; 