const {db,isArray,isEmpty, logError} = require("../util/helper")


exports.getList = async (req,res) => {
    try{
       const[list] = await db.query("SELECT * FROM category ORDER BY Id DESC");
    res.json({
        i_know_u:req.current_id,
        list:list,
    }); 
    } catch (error){
        await logError("category.getList", error);
        res.status(500).json({ error: "Failed to fetch categories", details: error.message });

    } 
};

exports.create =  async (req,res) => { 
    try{
        var sql = "INSERT INTO category (Name, Description, Status, ParentId) VALUES (:Name, :Description, :Status, :ParentId)";
        var [data] = await db.query(sql, {
            Name: req.body.Name,
            Description: req.body.Description,
            Status: req.body.Status,
            ParentId: req.body.ParentId,
        });
        res.json({
        data:data, 
        message:"Insert Success !",
    }); 
    }catch(error){
        await logError("category.create", error);
        res.status(500).json({ error: "Failed to create category", details: error.message });
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
        await logError("category.update", error);
        res.status(500).json({ error: "Failed to update category", details: error.message });
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
        await logError("category.remove", error);
        res.status(500).json({ error: "Failed to remove category", details: error.message });
    }
};
