const{ 
    getList, 
    create,
    update,
    remove 
   } = require("../controller/role.controller");

const { validate_token } = require("../controller/auth.controller");

module.exports = (app) => {
   app.get("/api/role", validate_token(), getList); 
   app.post("/api/role",validate_token(),create); 
   app.put("/api/role",validate_token(),update); 
   app.delete("/api/role",validate_token(),remove); 
};