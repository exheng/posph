const TelegramBot = require('node-telegram-bot-api');
const config = require('./src/util/config');
const { getHelpMessage, getStockMessage, getLowStockMessage } = require('./src/util/telegram');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const botToken = config.config.telegram.bot_token;
if (!botToken) {
    console.error('❌ Telegram bot token not configured in config.js');
    process.exit(1);
}

const bot = new TelegramBot(botToken, { polling: true });

console.log('🤖 Telegram bot is running in polling mode...');

function splitMessageSafe(message, maxLength = 4096) {
  const lines = message.split('\n');
  const chunks = [];
  let current = '';
  for (const line of lines) {
    if ((current + line + '\n').length > maxLength) {
      chunks.push(current);
      current = '';
    }
    current += line + '\n';
  }
  if (current) chunks.push(current);
  return chunks;
}

function sendLongMessage(bot, chatId, message, options) {
  const chunks = splitMessageSafe(message);
  for (const chunk of chunks) {
    bot.sendMessage(chatId, chunk, options);
  }
}

async function generateStockExcel(products, filePath) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Stock Report');
  sheet.columns = [
    { header: 'Name', key: 'name', width: 30 },
    { header: 'Barcode', key: 'barcode', width: 20 },
    { header: 'Quantity', key: 'qty', width: 10 },
    { header: 'Price', key: 'price', width: 10 },
    { header: 'Category', key: 'category_name', width: 20 },
    { header: 'Brand', key: 'brand_name', width: 20 },
  ];
  products.forEach((p, idx) => {
    const row = sheet.addRow(p);
    if (p.qty <= 10) {
      row.eachCell(cell => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFF00' } // Yellow
        };
      });
    }
  });
  await workbook.xlsx.writeFile(filePath);
}

async function generateStockPDF(products, filePath) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);
    doc.fontSize(18).text('Stock Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10);
    products.forEach((p, i) => {
      doc.text(`${i + 1}. ${p.name}`);
      doc.text(`   Barcode: ${p.barcode}`);
      doc.text(`   Quantity: ${p.qty}`);
      doc.text(`   Price: $${p.price}`);
      doc.text(`   Category: ${p.category_name || 'N/A'}`);
      doc.text(`   Brand: ${p.brand_name || 'N/A'}`);
      doc.moveDown(0.5);
    });
    doc.end();
    stream.on('finish', resolve);
    stream.on('error', reject);
  });
}

bot.onText(/\/help/, async (msg) => {
    const chatId = msg.chat.id;
    const response = getHelpMessage();
    bot.sendMessage(chatId, response, { parse_mode: 'HTML' });
});

bot.onText(/\/stock/, async (msg) => {
  const chatId = msg.chat.id;
  // Get products from DB
  const sql = `
    SELECT 
      p.name, p.barcode, p.qty, p.price,
      c.Name as category_name, b.label as brand_name
    FROM product p
    LEFT JOIN category c ON p.category_id = c.Id
    LEFT JOIN brand b ON p.brand = b.id
    WHERE p.status = 1
    ORDER BY p.qty ASC
  `;
  const { db } = require('./src/util/helper');
  const [products] = await db.query(sql);
  if (!products || products.length === 0) {
    bot.sendMessage(chatId, '📦 No products found in stock.');
    return;
  }
  // Generate Excel only
  const time = Date.now();
  const excelPath = path.join(__dirname, 'receipts', `stock_${time}.xlsx`);
  await generateStockExcel(products, excelPath);
  // Send file
  bot.sendMessage(chatId, '📦 Stock report is attached as an Excel file. Rows highlighted in yellow are nearly out of stock (qty ≤ 10).');
  await bot.sendDocument(chatId, excelPath, {}, { filename: `stock_report.xlsx` });
  // Optionally, delete file after sending
  setTimeout(() => { fs.unlink(excelPath, () => {}); }, 60000);
});

bot.onText(/\/low_stock/, async (msg) => {
    const chatId = msg.chat.id;
    const response = await getLowStockMessage();
    sendLongMessage(bot, chatId, response, { parse_mode: 'HTML' });
});

// Fallback for unknown commands
bot.on('message', (msg) => {
    const text = msg.text.trim().toLowerCase();
    if (!['/help', '/stock', '/low_stock'].includes(text)) {
        bot.sendMessage(msg.chat.id, 'Unknown command. Use /help to see available commands.');
    }
}); 