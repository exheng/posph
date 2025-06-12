const axios = require('axios');
const config = require('./config');

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

module.exports = {
    sendTelegramMessage
}; 