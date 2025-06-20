const express = require("express");
const router = express.Router();
const productController = require("../controller/product.controller");
const { validate_token } = require("../middleware/validate_token.js");
const { uploadFile } = require("../util/helper.js");

router.get("/", validate_token(), productController.getList);
router.post("/create", validate_token(), uploadFile.single('upload_image'), productController.create);
router.put("/update", validate_token(), uploadFile.single('upload_image'), productController.update);
router.delete("/remove", validate_token(), productController.remove);
router.post("/new_barcode", validate_token(), productController.newBarcode);
router.post("/alert-admin", validate_token(), productController.alertAdmin);

module.exports = router;