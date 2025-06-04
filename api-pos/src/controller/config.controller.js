const {db,isArray,isEmpty, logError} = require("../util/helper")


exports.getList = async (req,res) => {
    try{    
        const [category] = await db.query("SELECT Id, Name, Description FROM category");
        const [supplier] = await db.query("SELECT id, name, code FROM supplier");
        const [role] = await db.query("SELECT id, name, code FROM role");

        const purchase_status = [
            {
                label:"Pending",
                value:"Pending",
            },
            {
                label:"Approved",
                value:"Approved",
            },
            {
                label:"Shipped",
                value:"Shipped",
            },
            {
                label:"Received",
                value:"Received",
            },
            {
                label:"Issue",
                value:"Issue",
            },
        ]
    res.json({
        category,
        role,
        supplier,
        purchase_status,
    }); 
    } catch (error){
        logError("config.getList", error,res);

    } 
};