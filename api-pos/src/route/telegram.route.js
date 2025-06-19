const express = require('express');
const router = express.Router();
const { handleTelegramUpdate, setupWebhook } = require('../util/telegram');

// Webhook endpoint for Telegram bot updates
router.post('/webhook', async (req, res) => {
    try {
        const update = req.body;
        await handleTelegramUpdate(update);
        res.status(200).json({ ok: true });
    } catch (error) {
        console.error('Error handling webhook:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint to set up webhook (for initial setup)
router.post('/setup-webhook', async (req, res) => {
    try {
        const { webhookUrl } = req.body;
        if (!webhookUrl) {
            return res.status(400).json({ error: 'webhookUrl is required' });
        }
        
        await setupWebhook(webhookUrl);
        res.json({ message: 'Webhook setup completed' });
    } catch (error) {
        console.error('Error setting up webhook:', error);
        res.status(500).json({ error: 'Failed to setup webhook' });
    }
});

// Test endpoint to send a message
router.post('/send-message', async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ error: 'message is required' });
        }
        
        const { sendTelegramMessage } = require('../util/telegram');
        await sendTelegramMessage(message);
        res.json({ message: 'Message sent successfully' });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

module.exports = router; 