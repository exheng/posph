const express = require("express");
const router = express.Router();

const { 
    getList, 
    create,
    update,
    remove
} = require("../controller/purchase.controller");

const { validate_token } = require("../middleware/validate_token.js");

router.get("/", validate_token(), getList);
router.post("/create", validate_token(), create);
router.put("/update", validate_token(), update);
router.delete("/remove", validate_token(), remove);

module.exports = router; 