const express = require("express");
const router = express.Router();
const categoryController = require("../controller/category.controller");
const { validate_token } = require("../middleware/validate_token.js");

router.get("/", validate_token(), categoryController.getList);
router.post("/create", validate_token(), categoryController.create);
router.post("/update", validate_token(), categoryController.update);
router.post("/remove", validate_token(), categoryController.remove);

module.exports = router;