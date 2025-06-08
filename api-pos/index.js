const express = require("express");
const cors = require("cors");
const app = express();
const port = 8081;

app.use(cors());
app.use(express.json());

// Routes
require("./src/route/auth.route")(app);
require("./src/route/role.route")(app);
require("./src/route/product.route")(app);
require("./src/route/category.route")(app);
require("./src/route/supplier.route")(app);
require("./src/route/purchase.route")(app);
require("./src/route/config.route")(app);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});


