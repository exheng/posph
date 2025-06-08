const {db,isArray,isEmpty, logError} = require("../util/helper")


exports.getList = async (req,res) => {
    try{
        const sql = `
            SELECT 
                p.*,
                c.Name as category_name,
                c.Description as category_description
            FROM product p
            LEFT JOIN category c ON p.category_id = c.Id
            ORDER BY p.id DESC
        `;
        const [list] = await db.query(sql);
        res.json({
            list: list,
        }); 
    } catch (error){
        logError("product.getList", error,res);
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
    logError("product.create", error, res);
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
        logError("product.update", error, res);
    }
};

exports.remove = async (req, res) => {
    try {
        const [data] = await db.query("DELETE FROM product WHERE id = :id", {
            id: req.body.id
        });
        res.json({
            data: data,
            message: "Product deleted successfully!"
        });
    } catch (error) {
        logError("product.remove", error, res);
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
        logError("remove.create", error,res);
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