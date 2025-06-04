const {db,isArray,isEmpty, logError} = require("../util/helper")


exports.getList = async (req,res) => {
    try{    
        const [category] = await db.query("SELECT Id AS value, Name AS label, Description FROM category");
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
        ];
        const brand =[
            {label:"Apple", value:"Apple",country:"USA"},
            {label:"Samsung", value:"Samsung",country:"South Korea"},
            {label:"Techno", value:"Techno",country:"China"},
            {label:"ASUS", value:"ASUS",country:"USA"},
            {label:"DELL", value:"DELL",country:"USA"},
            {label:"Pixel", value:"Pixel",country:"USA"},
            {label:"Sony", value:"Sony",country:"South Korea"},
        ]
    res.json({
        category,
        role,
        supplier,
        purchase_status,
        brand,
    }); 
    } catch (error){
        logError("config.getList", error,res);

    } 
};