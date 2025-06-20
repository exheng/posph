const express = require("express");
const router = express.Router();
const authController = require("../controller/auth.controller");
const { validate_token } = require("../middleware/validate_token.js");

router.get("/", validate_token(), authController.getList);
router.post("/register", validate_token(), authController.register);
router.post("/login", authController.login);
router.get("/profile", validate_token(), authController.profile);
router.delete("/:id", validate_token(), authController.remove);
router.post("/upload-profile-pic", validate_token(), authController.uploadProfilePic);

module.exports = router;