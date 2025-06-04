const{ 
    getList, 
   } = require("../controller/config.controller");

const { validate_token } = require("../controller/auth.controller");

module.exports = (app) => {
   app.get("/api/config", validate_token(), getList);}