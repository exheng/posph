const {db,isArray,isEmpty, logError} = require("../util/helper")


exports.getList = async (req,res) => {
    try{
       const[list] = await db.query("SELECT * FROM category ORDER BY Id DESC");
    res.json({
        i_know_u:req.current_id,
        list:list,
    }); 
    } catch (error){
        logError("category.getList", error,res);

    } 
};

exports.create =  async (req,res) => { 
    try{
        res.json({
        body:req.body, 
        file : req.file,
        message:"Insert Success !",
    }); 
    }catch(error){
        logError("product.create", error,res);
    }
   
};

exports.update = async (req,res) => {
    try{
        
        var [data] = await db.query("UPDATE category SET Name=:Name, Description=:Description, Status=:Status, ParentId=:ParentId WHERE Id = :Id", {
            Id: req.body.Id,
            Name: req.body.Name,
            Description: req.body.Description,
            Status: req.body.Status,
            ParentId: req.body.ParentId,
        });
        res.json({
        data: data, 
        message : "Data Update Success!"
    }); 
    }catch(error){
        logError("update.create", error,res);
    }
};

exports.remove = async (req,res) => {
    try{
        
        var [data] = await db.query("DELETE FROM category WHERE Id = :Id", {
            Id: req.body.Id,
        });
        res.json({
        data: data, 
        message : "Data Delete Success!"
    }); 
    }catch(error){
        logError("remove.create", error,res);
    }
};

exports.newBarcode = async (req,res) => {
   try{
        var sql = "SELECT CONCAT('P', LPAD((SELECT COALESCE(MAX(id), 0) + 1 FROM product), 3, '0')) AS barcode";
        var [data] = await db.query(sql);
        res.json({
        barcode: data[0].barcode, 
        message : "Data Delete Success!"
    }); 
    }catch(error){
        logError("remove.create", error,res);
    }
}; 
