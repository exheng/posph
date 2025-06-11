const express = require("express");
const router = express.Router();
const configController = require("../controller/config.controller");
const { validate_token } = require("../middleware/validate_token.js");

router.get("/", validate_token(), configController.getList);
router.post("/update", validate_token(), configController.update);
router.post("/upload-logo", validate_token(), configController.uploadLogo);

module.exports = router;