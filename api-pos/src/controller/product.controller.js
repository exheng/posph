const { db, isArray, isEmpty, logError } = require("../util/helper");

// Helper: Check if barcode exists (excluding optional product ID for update)
const isExistBarcode = async (barcode, excludeId = null) => {
  try {
    let sql = "SELECT COUNT(id) AS Total FROM product WHERE barcode = :barcode";
    const params = { barcode };

    if (excludeId) {
      sql += " AND id != :excludeId";
      params.excludeId = excludeId;
    }

    const [data] = await db.query(sql, params);
    return data[0].Total > 0;
  } catch (error) {
    logError("product.isExistBarcode", error);
    return false;
  }
};

// GET list of categories
exports.getList = async (req, res) => {
  try {
    const [list] = await db.query("SELECT DISTINCT * FROM category ORDER BY Id DESC");
    console.log("Fetched List:", list);
    res.json({
      i_know_u: req.current_id,
      list: list,
    });
  } catch (error) {
    logError("product.getList", error, res);
  }
};

// CREATE new product
exports.create = async (req, res) => {
  try {
    if (await isExistBarcode(req.body.barcode)) {
      return res.json({
        error: {
          barcode: "Barcode already exists!",
        },
      });
    }

    const sql = `
      INSERT INTO product (category_id, barcode, name, brand, description, qty, price, discount, status, create_by, image)
      VALUES (:category_id, :barcode, :name, :brand, :description, :qty, :price, :discount, :status, :create_by, :image)
    `;

    const [data] = await db.query(sql, {
      ...req.body,
      image: req.file?.filename || null,
      create_by: req.auth?.name || "unknown",
    });

    res.json({
      data,
      message: "Insert Success!",
    });
  } catch (error) {
    logError("product.create", error, res);
  }
};

// UPDATE product
exports.update = async (req, res) => {
  try {
    const productId = req.body.id;

    if (await isExistBarcode(req.body.barcode, productId)) {
      return res.json({
        error: {
          barcode: "Barcode already exists!",
        },
      });
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
          update_by = :update_by,
          image = :image
      WHERE id = :id
    `;

    const [data] = await db.query(sql, {
      ...req.body,
      id: productId,
      image: req.file?.filename || null,
      update_by: req.auth?.name || "unknown",
    });

    res.json({
      data,
      message: "Data Update Success!",
    });
  } catch (error) {
    logError("product.update", error, res);
  }
};

// DELETE category
exports.remove = async (req, res) => {
  try {
    const [data] = await db.query("DELETE FROM category WHERE Id = :Id", {
      Id: req.body.Id,
    });
    res.json({
      data,
      message: "Data Delete Success!",
    });
  } catch (error) {
    logError("product.remove", error, res);
  }
};

// GENERATE new barcode
exports.newBarcode = async (req, res) => {
  try {
    const sql = `
      SELECT CONCAT('P', LPAD((SELECT COALESCE(MAX(id), 0) + 1 FROM product), 3, '0')) AS barcode
    `;
    const [data] = await db.query(sql);
    res.json({
      barcode: data[0].barcode,
      message: "New barcode generated successfully!",
    });
  } catch (error) {
    logError("product.newBarcode", error, res);
  }
};
