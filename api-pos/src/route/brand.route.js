const express = require("express");
const router = express.Router();
const brandController = require("../controller/brand.controller");
const { validate_token } = require("../middleware/validate_token.js");

router.get("/", validate_token(), brandController.getList);
router.post("/create", validate_token(), brandController.create);
router.put("/update", validate_token(), brandController.update);
router.delete("/remove", validate_token(), brandController.remove);

module.exports = router; 