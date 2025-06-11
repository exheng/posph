const express = require("express");
const router = express.Router();
const orderController = require("../controller/order.controller");
const { validate_token } = require("../middleware/validate_token.js");

router.get("/", validate_token(), orderController.getList);
router.post("/create", validate_token(), orderController.create);

module.exports = router; 