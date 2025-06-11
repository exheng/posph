const express = require("express");
const cors = require("cors");
const app = express();
const port = 8081;
const path = require("path");
const { config } = require("./src/util/config"); // Import config
const { initializeSettingsTables } = require("./src/controller/config.controller"); // Import initializeSettingsTables

// Import routes
const authRoutes = require("./src/route/auth.route");
const roleRoutes = require("./src/route/role.route");
const productRoutes = require("./src/route/product.route");
const categoryRoutes = require("./src/route/category.route");
const supplierRoutes = require("./src/route/supplier.route");
const purchaseRoutes = require("./src/route/purchase.route");
const configRoutes = require("./src/route/config.route");
const customerRoutes = require("./src/route/customer.route");
const orderRoutes = require("./src/route/order.route");
const brandRoutes = require("./src/route/brand.route"); // Import brand routes

const startServer = async () => {
    try {
        await initializeSettingsTables();
        console.log("Database tables initialized. Starting server...");

        app.use(cors());
        app.use(express.json());

        // Serve static files from the 'pos_img' directory as defined in config
        app.use('/pos_img', express.static(config.img_path));

        // Use routes
        app.use('/api/auth', authRoutes);
        app.use('/api/role', roleRoutes);
        app.use('/api/product', productRoutes);
        app.use('/api/category', categoryRoutes);
        app.use('/api/supplier', supplierRoutes);
        app.use('/api/purchase', purchaseRoutes);
        app.use('/api/config', configRoutes);
        app.use('/api/customer', customerRoutes);
        app.use('/api/order', orderRoutes);
        app.use('/api/brand', brandRoutes); // Use brand routes

        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (error) {
        console.error("Failed to initialize database tables or start server:", error);
        process.exit(1); // Exit if essential services fail to start
    }
};

startServer();


