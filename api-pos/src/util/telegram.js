const axios = require('axios');
const config = require('./config');
const { db } = require('./helper');

const sendTelegramMessage = async (message) => {
    try {
        const botToken = config.config.telegram.bot_token;
        const chatId = config.config.telegram.chat_id;

        if (!botToken || !chatId) {
            console.warn('Telegram bot token or chat ID not configured');
            return;
        }

        const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
        await axios.post(url, {
            chat_id: chatId,
            text: message,
            parse_mode: 'HTML'
        });
    } catch (error) {
        console.error('Error sending Telegram message:', error);
    }
};

// Handle incoming Telegram updates (webhook)
const handleTelegramUpdate = async (update) => {
    try {
        if (!update.message || !update.message.text) {
            return;
        }

        const chatId = update.message.chat.id;
        const text = update.message.text.trim();
        const botToken = config.config.telegram.bot_token;

        if (!botToken) {
            console.warn('Telegram bot token not configured');
            return;
        }

        let response = '';

        switch (text.toLowerCase()) {
            case '/help':
                response = getHelpMessage();
                break;
            case '/stock':
                response = await getStockMessage();
                break;
            case '/low_stock':
                response = await getLowStockMessage();
                break;
            default:
                response = 'Unknown command. Use /help to see available commands.';
        }

        // Send response back to the user
        const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
        await axios.post(url, {
            chat_id: chatId,
            text: response,
            parse_mode: 'HTML'
        });

    } catch (error) {
        console.error('Error handling Telegram update:', error);
    }
};

const getHelpMessage = () => {
    return `<b>🤖 POS System Bot Commands</b>

Available commands:
• <code>/help</code> - Show all available commands
• <code>/stock</code> - Show all stock products in list
• <code>/low_stock</code> - Show low stock products

<i>Use any of these commands to get information about your inventory.</i>`;
};

const getStockMessage = async () => {
    try {
        const sql = `
            SELECT 
                p.name,
                p.barcode,
                p.qty,
                p.price,
                c.Name as category_name,
                b.label as brand_name
            FROM product p
            LEFT JOIN category c ON p.category_id = c.Id
            LEFT JOIN brand b ON p.brand = b.id
            WHERE p.status = 1
            ORDER BY p.qty ASC
        `;
        
        const [products] = await db.query(sql);
        
        if (products.length === 0) {
            return '📦 <b>No products found in stock.</b>';
        }

        let message = '📦 <b>Current Stock Report</b>\n\n';
        
        // Count products by status
        let greenCount = 0, yellowCount = 0, redCount = 0, outOfStockCount = 0;
        
        products.forEach((product, index) => {
            let statusEmoji, statusText;
            
            if (product.qty === 0) {
                statusEmoji = '❌';
                statusText = 'OUT OF STOCK';
                outOfStockCount++;
            } else if (product.qty < 10) {
                statusEmoji = '🔴';
                statusText = 'LOW STOCK';
                redCount++;
            } else if (product.qty <= 15) {
                statusEmoji = '🟡';
                statusText = 'MEDIUM STOCK';
                yellowCount++;
            } else {
                statusEmoji = '🟢';
                statusText = 'GOOD STOCK';
                greenCount++;
            }
            
            message += `${statusEmoji} <b>${product.name}</b>\n`;
            message += `   📊 <b>Quantity:</b> <code>${product.qty}</code>\n`;
            message += `   🏷️ <b>Status:</b> ${statusText}\n`;
            message += `   💰 <b>Price:</b> $${product.price}\n`;
            message += `   🏷️ <b>Category:</b> ${product.category_name || 'N/A'}\n`;
            message += `   🏭 <b>Brand:</b> ${product.brand_name || 'N/A'}\n`;
            message += `   📋 <b>Barcode:</b> <code>${product.barcode}</code>\n`;
            message += '\n';
        });

        // Add summary statistics
        message += `\n📈 <b>Stock Summary:</b>\n`;
        message += `🟢 <b>Good Stock</b>: ${greenCount} products (&gt;15 units)\n`;
        message += `🟡 <b>Medium Stock</b>: ${yellowCount} products (10-15 units)\n`;
        message += `🔴 <b>Low Stock</b>: ${redCount} products (&lt;10 units)\n`;
        message += `❌ <b>Out of Stock</b>: ${outOfStockCount} products\n`;
        message += `\n📊 <b>Total Products:</b> ${products.length}`;
        
        return message;

    } catch (error) {
        console.error('Error getting stock message:', error);
        return '❌ <b>Error retrieving stock information.</b>';
    }
};

const getLowStockMessage = async () => {
    try {
        // Define low stock threshold (you can adjust this value)
        const lowStockThreshold = 10;
        
        const sql = `
            SELECT 
                p.name,
                p.barcode,
                p.qty,
                p.price,
                c.Name as category_name,
                b.label as brand_name
            FROM product p
            LEFT JOIN category c ON p.category_id = c.Id
            LEFT JOIN brand b ON p.brand = b.id
            WHERE p.status = 1 AND p.qty <= :threshold
            ORDER BY p.qty ASC
        `;
        
        const [products] = await db.query(sql, { threshold: lowStockThreshold });
        
        if (products.length === 0) {
            return `✅ <b>No low stock products found!</b>\n\nAll products have more than ${lowStockThreshold} units in stock.`;
        }

        let message = `⚠️ <b>Low Stock Alert (≤${lowStockThreshold} units)</b>\n\n`;
        
        products.forEach((product, index) => {
            const urgency = product.qty === 0 ? '🚨' : product.qty <= 5 ? '⚠️' : '📉';
            message += `${urgency} <b>${product.name}</b>\n`;
            message += `   📊 Quantity: ${product.qty}\n`;
            message += `   💰 Price: $${product.price}\n`;
            message += `   🏷️ Category: ${product.category_name || 'N/A'}\n`;
            message += `   🏭 Brand: ${product.brand_name || 'N/A'}\n`;
            message += `   📋 Barcode: ${product.barcode}\n\n`;
        });

        message += `\n📈 <b>Total Low Stock Products:</b> ${products.length}`;
        return message;

    } catch (error) {
        console.error('Error getting low stock message:', error);
        return '❌ <b>Error retrieving low stock information.</b>';
    }
};

// Set up webhook for the bot
const setupWebhook = async (webhookUrl) => {
    try {
        const botToken = config.config.telegram.bot_token;
        if (!botToken) {
            console.warn('Telegram bot token not configured');
            return;
        }

        const url = `https://api.telegram.org/bot${botToken}/setWebhook`;
        const response = await axios.post(url, {
            url: webhookUrl
        });

        if (response.data.ok) {
            console.log('Telegram webhook set successfully');
        } else {
            console.error('Failed to set Telegram webhook:', response.data);
        }
    } catch (error) {
        console.error('Error setting up Telegram webhook:', error);
    }
};

module.exports = {
    sendTelegramMessage,
    handleTelegramUpdate,
    setupWebhook,
    getHelpMessage,
    getStockMessage,
    getLowStockMessage
}; 