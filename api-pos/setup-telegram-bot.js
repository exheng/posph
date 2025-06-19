const axios = require('axios');
const config = require('./src/util/config');

async function setupTelegramBot() {
    try {
        const botToken = config.config.telegram.bot_token;
        const chatId = config.config.telegram.chat_id;

        if (!botToken) {
            console.error('❌ Telegram bot token not configured in config.js');
            return;
        }

        console.log('🤖 Setting up Telegram Bot...\n');

        // Test bot token
        console.log('1. Testing bot token...');
        const testUrl = `https://api.telegram.org/bot${botToken}/getMe`;
        const testResponse = await axios.get(testUrl);
        
        if (testResponse.data.ok) {
            const botInfo = testResponse.data.result;
            console.log(`✅ Bot connected successfully!`);
            console.log(`   Bot Name: ${botInfo.first_name}`);
            console.log(`   Username: @${botInfo.username}`);
            console.log(`   Bot ID: ${botInfo.id}\n`);
        } else {
            console.error('❌ Invalid bot token');
            return;
        }

        // Get webhook info
        console.log('2. Checking current webhook...');
        const webhookUrl = `https://api.telegram.org/bot${botToken}/getWebhookInfo`;
        const webhookResponse = await axios.get(webhookUrl);
        
        if (webhookResponse.data.ok) {
            const webhookInfo = webhookResponse.data.result;
            if (webhookInfo.url) {
                console.log(`✅ Webhook is set to: ${webhookInfo.url}`);
            } else {
                console.log('⚠️  No webhook is currently set');
            }
        }

        console.log('\n📋 Setup Instructions:');
        console.log('1. Make sure your server is accessible from the internet');
        console.log('2. Set up a webhook URL pointing to your server');
        console.log('3. Use the following endpoint to set webhook:');
        console.log(`   POST /api/telegram/setup-webhook`);
        console.log('   Body: { "webhookUrl": "https://your-domain.com/api/telegram/webhook" }');
        
        console.log('\n4. Test the bot by sending these commands:');
        console.log('   /help - Show all available commands');
        console.log('   /stock - Show all stock products');
        console.log('   /low_stock - Show low stock products');

        if (chatId) {
            console.log(`\n5. Your chat ID is configured: ${chatId}`);
            console.log('   You can test sending a message using:');
            console.log('   POST /api/telegram/send-message');
            console.log('   Body: { "message": "Hello from POS System!" }');
        } else {
            console.log('\n⚠️  Chat ID not configured. Add it to config.js to receive notifications.');
        }

        console.log('\n🎉 Telegram bot setup completed!');

    } catch (error) {
        console.error('❌ Error setting up Telegram bot:', error.message);
        if (error.response) {
            console.error('Response:', error.response.data);
        }
    }
}

// Run setup if this file is executed directly
if (require.main === module) {
    setupTelegramBot();
}

module.exports = { setupTelegramBot }; 