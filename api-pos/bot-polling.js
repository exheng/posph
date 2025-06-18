const TelegramBot = require('node-telegram-bot-api');
const config = require('./src/util/config');
const { getHelpMessage, getStockMessage, getLowStockMessage } = require('./src/util/telegram');

const botToken = config.config.telegram.bot_token;
if (!botToken) {
    console.error('❌ Telegram bot token not configured in config.js');
    process.exit(1);
}

const bot = new TelegramBot(botToken, { polling: true });

console.log('🤖 Telegram bot is running in polling mode...');

bot.onText(/\/help/, async (msg) => {
    const chatId = msg.chat.id;
    const response = getHelpMessage();
    bot.sendMessage(chatId, response, { parse_mode: 'HTML' });
});

bot.onText(/\/stock/, async (msg) => {
    const chatId = msg.chat.id;
    const response = await getStockMessage();
    bot.sendMessage(chatId, response, { parse_mode: 'HTML' });
});

bot.onText(/\/low_stock/, async (msg) => {
    const chatId = msg.chat.id;
    const response = await getLowStockMessage();
    bot.sendMessage(chatId, response, { parse_mode: 'HTML' });
});

// Fallback for unknown commands
bot.on('message', (msg) => {
    const text = msg.text.trim().toLowerCase();
    if (!['/help', '/stock', '/low_stock'].includes(text)) {
        bot.sendMessage(msg.chat.id, 'Unknown command. Use /help to see available commands.');
    }
}); 