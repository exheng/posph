const express = require("express");
const router = express.Router();
const customerController = require("../controller/customer.controller");
const { validate_token } = require("../middleware/validate_token.js");

router.get("/", validate_token(), customerController.getList);
router.post("/create", validate_token(), customerController.create);
router.post("/update", validate_token(), customerController.update);
router.delete("/remove", validate_token(), customerController.remove);

module.exports = router; 