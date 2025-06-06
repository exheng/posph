const{ 
    getList, 
    create,
    update,
    remove, 
    newBarcode
   } = require("../controller/product.controller");

const { validate_token } = require("../controller/auth.controller");
const { uploadFile } = require ("../util/helper")

module.exports = (app) => {
   app.get("/api/product",validate_token(), getList); 
   app.post("/api/product",uploadFile.single("upload_image"),create); 
   app.put("/api/product",validate_token(),update); 
   app.delete("/api/product",validate_token(),remove); 
   app.post("/api/new_barcode",validate_token(),newBarcode); 
};