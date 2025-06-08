const { 
    create,
    getList
} = require("../controller/order.controller");

const { validate_token } = require("../controller/auth.controller");

module.exports = (app) => {
    app.post("/api/order", validate_token(), create);
    app.get("/api/order", validate_token(), getList);
}; 