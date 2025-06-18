# Telegram Bot for POS System

This Telegram bot provides real-time access to your POS system inventory through simple commands.

## Features

- 📦 **Stock Management**: View all products and their current stock levels
- ⚠️ **Low Stock Alerts**: Get notified about products running low on stock
- 🤖 **Easy Commands**: Simple text commands to get information instantly

## Available Commands

| Command | Description |
|---------|-------------|
| `/help` | Show all available commands |
| `/stock` | Show all stock products in list |
| `/low_stock` | Show low stock products (≤10 units) |

## Setup Instructions

### 1. Configure Bot Token and Chat ID

Edit `src/util/config.js` and update the Telegram configuration:

```javascript
telegram: {
    bot_token: "YOUR_BOT_TOKEN_HERE",
    chat_id: "YOUR_CHAT_ID_HERE"
}
```

### 2. Get Your Bot Token

1. Message [@BotFather](https://t.me/botfather) on Telegram
2. Send `/newbot` command
3. Follow the instructions to create your bot
4. Copy the bot token provided

### 3. Get Your Chat ID

1. Start a conversation with your bot
2. Send any message to the bot
3. Visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
4. Find your chat ID in the response

### 4. Set Up Webhook

Your server needs to be accessible from the internet. Use one of these methods:

#### Option A: Using ngrok (for development)
```bash
# Install ngrok
npm install -g ngrok

# Start your server
npm start

# In another terminal, expose your server
ngrok http 3000

# Use the ngrok URL to set webhook
curl -X POST http://localhost:3000/api/telegram/setup-webhook \
  -H "Content-Type: application/json" \
  -d '{"webhookUrl": "https://your-ngrok-url.ngrok.io/api/telegram/webhook"}'
```

#### Option B: Using your domain (for production)
```bash
curl -X POST https://your-domain.com/api/telegram/setup-webhook \
  -H "Content-Type: application/json" \
  -d '{"webhookUrl": "https://your-domain.com/api/telegram/webhook"}'
```

### 5. Test the Bot

Run the setup script to verify everything is working:

```bash
node setup-telegram-bot.js
```

## API Endpoints

### Webhook Endpoint
- **POST** `/api/telegram/webhook`
- Handles incoming Telegram updates

### Setup Webhook
- **POST** `/api/telegram/setup-webhook`
- Body: `{ "webhookUrl": "https://your-domain.com/api/telegram/webhook" }`

### Send Message
- **POST** `/api/telegram/send-message`
- Body: `{ "message": "Your message here" }`

## Example Usage

### Stock Report
Send `/stock` to get a detailed report of all products:
```
📦 Current Stock Report

✅ Product Name
   📊 Quantity: 25
   💰 Price: $19.99
   🏷️ Category: Electronics
   🏭 Brand: Samsung
   📋 Barcode: P001

📈 Total Products: 15
```

### Low Stock Alert
Send `/low_stock` to see products with 10 or fewer units:
```
⚠️ Low Stock Alert (≤10 units)

🚨 Out of Stock Product
   📊 Quantity: 0
   💰 Price: $29.99
   🏷️ Category: Clothing
   🏭 Brand: Nike
   📋 Barcode: P002

⚠️ Low Stock Product
   📊 Quantity: 3
   💰 Price: $15.99
   🏷️ Category: Books
   🏭 Brand: N/A
   📋 Barcode: P003

📈 Total Low Stock Products: 2
```

## Customization

### Change Low Stock Threshold
Edit the `lowStockThreshold` variable in `src/util/telegram.js`:

```javascript
const lowStockThreshold = 10; // Change this value
```

### Add New Commands
Add new cases in the `handleTelegramUpdate` function:

```javascript
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
    case '/new_command':
        response = await getNewCommandMessage();
        break;
    default:
        response = 'Unknown command. Use /help to see available commands.';
}
```

## Troubleshooting

### Bot Not Responding
1. Check if webhook is set correctly
2. Verify bot token is valid
3. Ensure server is accessible from internet
4. Check server logs for errors

### Database Connection Issues
1. Verify database is running
2. Check database credentials in config
3. Ensure product table exists

### Permission Issues
1. Make sure bot has permission to send messages
2. Verify chat ID is correct
3. Check if bot is blocked by user

## Security Notes

- Keep your bot token secure
- Use HTTPS for webhook URLs in production
- Consider implementing authentication for webhook endpoints
- Regularly update dependencies

## Support

For issues or questions:
1. Check server logs for error messages
2. Verify all configuration settings
3. Test bot token with Telegram API directly
4. Ensure database connectivity 