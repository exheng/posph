const { 
    getList, 
    create,
    update,
    remove
} = require("../controller/purchase.controller");

const { validate_token } = require("../controller/auth.controller");

module.exports = (app) => {
    app.get("/api/purchase", validate_token(), getList);
    app.post("/api/purchase", validate_token(), create);
    app.put("/api/purchase", validate_token(), update);
    app.delete("/api/purchase", validate_token(), remove);
}; 