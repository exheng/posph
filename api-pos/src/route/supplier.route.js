const express = require("express");
const router = express.Router();
const supplierController = require("../controller/supplier.controller");
const { validate_token } = require("../middleware/validate_token.js");

router.get("/", validate_token(), supplierController.getList);
router.post("/create", validate_token(), supplierController.create);
router.put("/update", validate_token(), supplierController.update);
router.delete("/remove", validate_token(), supplierController.remove);

module.exports = router;