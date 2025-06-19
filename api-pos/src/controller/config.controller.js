const {db,isArray,isEmpty, logError} = require("../util/helper")
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure multer for logo upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Save to XAMPP htdocs/pos_img
        const uploadDir = 'C:/xampp/htdocs/pos_img/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG and GIF are allowed.'));
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
}).single('logo');

// Initialize settings tables if they don't exist
exports.initializeSettingsTables = async () => {
    let connection;
    try {
        connection = await db.getConnection();
        // Create store_settings table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS store_settings (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(255),
                address TEXT,
                phone VARCHAR(50),
                email VARCHAR(255),
                website VARCHAR(255),
                currency VARCHAR(10) DEFAULT 'USD',
                tax_rate DECIMAL(5,2) DEFAULT 0.00,
                logo VARCHAR(255),
                exchange_rate_to_usd DECIMAL(10,4) DEFAULT 1.0000,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // Create system_settings table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS system_settings (
                id INT PRIMARY KEY AUTO_INCREMENT,
                enable_notifications BOOLEAN DEFAULT true,
                enable_email_notifications BOOLEAN DEFAULT true,
                enable_sms_notifications BOOLEAN DEFAULT false,
                low_stock_threshold INT DEFAULT 10,
                enable_auto_backup BOOLEAN DEFAULT true,
                backup_frequency VARCHAR(50) DEFAULT 'daily',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // Create appearance_settings table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS appearance_settings (
                id INT PRIMARY KEY AUTO_INCREMENT,
                primary_color VARCHAR(20) DEFAULT '#1890ff',
                secondary_color VARCHAR(20) DEFAULT '#52c41a',
                theme VARCHAR(20) DEFAULT 'light',
                enable_animations BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // Create brand table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS brand (
                id INT PRIMARY KEY AUTO_INCREMENT,
                label VARCHAR(255) NOT NULL,
                country VARCHAR(100),
                note TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // Insert default settings if they don't exist
        const [storeSettings] = await connection.query("SELECT id FROM store_settings WHERE id = 1");
        if (storeSettings.length === 0) {
            await connection.query(`
                INSERT INTO store_settings (id, name, address, phone, email, website, currency, tax_rate, exchange_rate_to_usd)
                VALUES (1, 'PhoneShop POS', '123 Main St', '+1234567890', 'contact@phoneshop.com', 'www.phoneshop.com', 'USD', 0.00, 1.0000)
            `);
        }

        const [systemSettings] = await connection.query("SELECT id FROM system_settings WHERE id = 1");
        if (systemSettings.length === 0) {
            await connection.query(`
                INSERT INTO system_settings (id, enable_notifications, enable_email_notifications, enable_sms_notifications, low_stock_threshold, enable_auto_backup, backup_frequency)
                VALUES (1, true, true, false, 10, true, 'daily')
            `);
        }

        const [appearanceSettings] = await connection.query("SELECT id FROM appearance_settings WHERE id = 1");
        if (appearanceSettings.length === 0) {
            await connection.query(`
                INSERT INTO appearance_settings (id, primary_color, secondary_color, theme, enable_animations)
                VALUES (1, '#1890ff', '#52c41a', 'light', true)
            `);
        }
        console.log('Database tables initialized successfully!');
    } catch (error) {
        console.error("Error initializing settings tables:", error);
    } finally {
        if (connection) connection.release();
    }
};

exports.getList = async (req, res) => {
    let connection;
    try {
        connection = await db.getConnection();
        // Get store settings
        const [storeSettings] = await connection.query(`
            SELECT 
                name, address, phone, email, website, 
                currency, tax_rate, logo, exchange_rate_to_usd
            FROM store_settings 
            WHERE id = 1
        `);

        // Get system settings
        const [systemSettings] = await connection.query(`
            SELECT 
                enable_notifications, enable_email_notifications,
                enable_sms_notifications, low_stock_threshold,
                enable_auto_backup, backup_frequency
            FROM system_settings 
            WHERE id = 1
        `);

        // Get appearance settings
        const [appearanceSettings] = await connection.query(`
            SELECT 
                primary_color, secondary_color,
                theme, enable_animations
            FROM appearance_settings 
            WHERE id = 1
        `);

        const [category] = await connection.query("SELECT Id AS value, Name AS label FROM category WHERE Status = 1");
        const [supplier] = await connection.query("SELECT id AS value, name AS label FROM supplier");
        const [role] = await connection.query("SELECT id AS value, name AS label FROM role");
        const [brand] = await connection.query("SELECT id AS value, label, country FROM brand");

        const purchase_status = [
            {
                label: "Pending",
                value: "pending"
            },
            {
                label: "Approved",
                value: "approved"
            },
            {
                label: "Shipped",
                value: "shipped"
            },
            {
                label: "Received",
                value: "received"
            },
            {
                label: "Cancelled",
                value: "cancelled"
            }
        ];

        res.json({
            category,
            role,
            supplier,
            purchase_status,
            brand,
            store: storeSettings[0] || {},
            system: systemSettings[0] || {},
            appearance: appearanceSettings[0] || {}
        }); 
    } catch (error) {
        await logError("config.getList", error);
        res.status(500).json({
            error: "Failed to fetch configuration",
            details: error.message
        });
    } finally {
        if (connection) connection.release();
    }
};

exports.update = async (req, res) => {
    try {
        const { store, system, appearance } = req.body;

        // Update store settings
        if (store) {
            await db.query(`
                UPDATE store_settings 
                SET 
                    name = :name,
                    address = :address,
                    phone = :phone,
                    email = :email,
                    website = :website,
                    currency = :currency,
                    tax_rate = :tax_rate,
                    logo = :logo,
                    exchange_rate_to_usd = :exchange_rate_to_usd
                WHERE id = 1
            `, store);
        }

        // Update system settings
        if (system) {
            await db.query(`
                UPDATE system_settings 
                SET 
                    enable_notifications = :enable_notifications,
                    enable_email_notifications = :enable_email_notifications,
                    enable_sms_notifications = :enable_sms_notifications,
                    low_stock_threshold = :low_stock_threshold,
                    enable_auto_backup = :enable_auto_backup,
                    backup_frequency = :backup_frequency
                WHERE id = 1
            `, system);
        }

        // Update appearance settings
        if (appearance) {
            await db.query(`
                UPDATE appearance_settings 
                SET 
                    primary_color = :primary_color,
                    secondary_color = :secondary_color,
                    theme = :theme,
                    enable_animations = :enable_animations
                WHERE id = 1
            `, appearance);
        }

        res.json({
            message: "Settings updated successfully"
        });
    } catch (error) {
        logError("config.update", error, res);
    }
};

exports.uploadLogo = (req, res) => {
    upload(req, res, async function(err) {
        if (err) {
            return res.status(400).json({
                error: err.message
            });
        }

        if (!req.file) {
            return res.status(400).json({
                error: "No file uploaded"
            });
        }

        try {
            // Update the logo path in the database
            await db.query(`
                UPDATE store_settings 
                SET logo = :logo 
                WHERE id = 1
            `, {
                logo: req.file.filename
            });

            res.json({
                message: "Logo uploaded successfully",
                filename: req.file.filename
            });
        } catch (error) {
            logError("config.uploadLogo", error, res);
        }
    });
};