const {db,isArray,isEmpty, logError} = require("../util/helper")


exports.getList = async (req,res) => {
    try{
        var sql ="SELECT * FROM supplier";
        var txtSearch = req.query.txtSearch;
        if (txtSearch !== "") {
            sql += " WHERE name LIKE :txtSearch OR code LIKE :txtSearch OR tel LIKE :txtSearch OR email LIKE :txtSearch"; 
        }

       const[list] = await db.query(sql,{txtSearch:"%"+txtSearch+"%"});
    res.json({
        i_know_u:req.current_id,
        list,
    }); 
    } catch (error){
        await logError("supplier.getList", error);
        res.status(500).json({ error: "Failed to fetch suppliers", details: error.message });

    } 
};
//:name,:code,:tel,:email,:address,:website,:note,:create_by,:create_at
exports.create =  async (req,res) => { 
    try{
        var sql = "INSERT INTO supplier (name, code, tel, email, address, website, note, create_by) VALUES (:name,:code,:tel,:email,:address,:website,:note,:create_by)";
        var [data] = await db.query(sql, {
           ...req.body,
            create_by: req.auth?.name,
        });
        res.json({
        data:data, 
        message:"Insert Success !",
    }); 
    }catch(error){
        await logError("supplier.create", error);
        res.status(500).json({ error: "Failed to create supplier", details: error.message });
    }
   
};

exports.update = async (req,res) => {
     try{
        var sql = "UPDATE supplier SET name=:name, code=:code, tel=:tel, email=:email, address=:address, website=:website, note=:note WHERE id=:id";
        var [data] = await db.query(sql, {
           ...req.body,
        });
        res.json({
        data:data, 
        message:"Update Success !",
    }); 
    }catch(error){
        await logError("supplier.update", error);
        res.status(500).json({ error: "Failed to update supplier", details: error.message });
    }
};

exports.remove = async (req,res) => {
    try{
        const { id } = req.body;
        // Check for related purchase orders
        const [purchaseOrders] = await db.query("SELECT COUNT(*) as count FROM purchase_order WHERE supplier_id = :id", { id });
        if (purchaseOrders[0].count > 0) {
            return res.status(400).json({
                error: true,
                message: "Cannot delete this supplier because it is referenced in purchase orders."
            });
        }
        var [data] = await db.query("DELETE FROM supplier WHERE id = :id", { id });
        res.json({
            data: data, 
            message : "Data Delete Success!"
        });
    }catch(error){
        await logError("supplier.remove", error);
        res.status(500).json({ error: "Failed to remove supplier", details: error.message });
    }
};
