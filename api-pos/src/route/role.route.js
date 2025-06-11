const express = require("express");
const router = express.Router();
const roleController = require("../controller/role.controller");
const { validate_token } = require("../middleware/validate_token.js");

router.get("/", validate_token(), roleController.getList);
router.post("/create", validate_token(), roleController.create);
router.post("/update", validate_token(), roleController.update);
router.post("/remove", validate_token(), roleController.remove);

module.exports = router;