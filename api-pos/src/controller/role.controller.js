const {db,isArray,isEmpty, logError} = require("../util/helper")


exports.getList = async (req,res) => {
    try{
       const[list] = await db.query("SELECT * FROM role");
    res.json({
        i_know_u:req.current_id,
        list:list,
    }); 
    } catch (error){
        await logError("role.getList", error);
        res.status(500).json({ error: "Failed to fetch roles", details: error.message });

    } 
};

exports.create =  async (req,res) => { 
    try{
        var sql = "INSERT INTO role (name, code) VALUES (:name, :code)";
        var [data] = await db.query(sql, {
            name: req.body.name,
            code: req.body.code,
            });
        res.json({
        data:data, 
        message:"Insert Success !",
    }); 
    }catch(error){
        await logError("role.create", error);
        res.status(500).json({ error: "Failed to create role", details: error.message });
    }
   
};

exports.update = async (req,res) => {
    try{
        
        var [data] = await db.query("UPDATE role SET name=:name, code=:code WHERE id = :id", {
            id: req.body.id,
            name: req.body.name,
            code: req.body.code,
        });
        res.json({
        data: data, 
        message : "Data Update Success!"
    }); 
    }catch(error){
        await logError("role.update", error);
        res.status(500).json({ error: "Failed to update role", details: error.message });
    }
};

exports.remove = async (req,res) => {
    try{
        
        var [data] = await db.query("DELETE FROM role WHERE id = :id", {
            id: req.body.id,
        });
        res.json({
        data: data, 
        message : "Data Delete Success!"
    }); 
    }catch(error){
        await logError("role.remove", error);
        res.status(500).json({ error: "Failed to remove role", details: error.message });
    }
};
