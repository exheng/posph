const express = require("express");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended:false }));
app.use(cors({origin:"*"}));

app.get("/",(req, res)=>{
    const list = [
        {id: 1 , name: "a" },
        {id: 2 , name: "b" },
        
    ];
    res.json({
        list,
    });
});
app.get("/api/home",(req, res)=>{
    const data = [
        {
         title : "Customer",
         obj:{
            total : 100,
            total_m : 50,
            total_f : 10,
         }
   
        },
        {
            title : "sale",
            obj:{
               total : 200,
               due : 50,
            }
      
        },
        {
            title : "Expens",
            obj:{
               total : 1000,
            }
      
        },
        {
            title : "Employee",
            obj:{
               total : 1000,
            }
      
        },
        {
            title : "stoke",
            obj:{
               total : 100,
            }
      
        },
    ]
    res.json({
        list : data,
    });
});

require("./src/route/category.route")(app);
require("./src/route/auth.route")(app);
require("./src/route/role.route")(app);
require("./src/route/supplier.route")(app);
require("./src/route/config.route")(app);
require("./src/route/product.route")(app);

const PORT = 8081;
app.listen(PORT, () =>{
    console.log("http://localhost:" + PORT);
    
});


