const express = require("express");
const cors = require("cors");
const app = express();
const port = 8081;
const path = require("path");
const { config } = require("./src/util/config"); // Import config

app.use(cors());
app.use(express.json());

// Serve static files from the 'pos_img' directory as defined in config
app.use('/pos_img', express.static(config.img_path));

// Routes
require("./src/route/auth.route")(app);
require("./src/route/role.route")(app);
require("./src/route/product.route")(app);
require("./src/route/category.route")(app);
require("./src/route/supplier.route")(app);
require("./src/route/purchase.route")(app);
require("./src/route/config.route")(app);
require("./src/route/customer.route")(app);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});


