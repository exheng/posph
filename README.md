# POS-Ph: Point of Sale System

A modern, full-featured Point of Sale (POS) system for retail shops, built with Node.js, Express, MySQL, React, Vite, and Ant Design. Includes real-time Telegram notifications, role-based access control, and a beautiful, responsive UI.

---

## Features

- **User Authentication & Roles**: Secure login, JWT tokens, and role-based access (Admin, Manager, Cashier)
- **Product Management**: Add, edit, delete, and view products with barcode support
- **Inventory & Stock Alerts**: Real-time low stock alerts, stock management, and supplier integration
- **Order & Sales Management**: Create and manage sales orders, receipts, and customer selection
- **Purchase Orders**: Manage suppliers and purchase orders
- **Reporting**: Sales, inventory, and performance reports (admin/manager only)
- **Telegram Bot Integration**: Instant notifications for low stock and order events
- **Responsive UI**: Built with React, Vite, and Ant Design for a fast, modern experience
- **State Management**: Zustand for simple, scalable state

---

## Tech Stack

- **Frontend**: React 18, Vite, Ant Design, Zustand, Axios
- **Backend**: Node.js, Express.js, MySQL, JWT, Multer, PDFKit, ExcelJS
- **Notifications**: Telegram Bot API

---

## Project Structure

```
Pos-Ph/
  api-pos/      # Backend (Node.js/Express)
  web-pos/      # Frontend (React/Vite)
  src-note/     # Notes, SQL, and documentation
```

---

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MySQL Server

### Backend Setup
```bash
cd api-pos
npm install
# Configure your database in src/util/config.js or via environment variables
npm run dev
```

### Frontend Setup
```bash
cd web-pos
npm install
npm run dev
```

### Database
- Import the SQL files from `src-note/database/table/` into your MySQL server.
- Update database credentials in `api-pos/src/util/config.js` as needed.

### Telegram Bot
- Create a Telegram bot and get the token from [BotFather](https://core.telegram.org/bots#botfather)
- Set your bot token and chat ID in environment variables or `api-pos/src/util/config.js`
- Start the bot with:
  ```bash
  npm run bot
  # or
  npm run poll
  ```

---

## Usage

- **Admin/Manager**: Full access to all features
- **Cashier**: Can use POS, view products, customers, orders, and stock alerts. Cannot add/edit/delete products or access reports.
- **Stock Alerts**: Cashiers can alert admins via Telegram if stock is low; only admins/managers can create purchase orders.

---

## Contribution

1. Fork this repository
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Create a new Pull Request

---

## License

This project is licensed under the MIT License.

---

## Credits

- [Ant Design](https://ant.design/)
- [Vite](https://vitejs.dev/)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Zustand](https://zustand-demo.pmnd.rs/)

---

## Screenshots

> Add screenshots of your UI here for a better GitHub presentation!

---

## Contact

For questions or support, please open an issue or contact the maintainer. 