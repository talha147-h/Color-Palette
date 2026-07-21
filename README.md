# ApothecaryShop — Pharmaceutical Inventory Management System

A full-stack MERN application for managing pharmaceutical inventory — tracking products, suppliers, purchase orders, stock movements, and distribution across a pharmacy or healthcare organization.

## Features

- **Authentication & Roles** — JWT-based auth with role-based access (Admin, Staff, Distribution Staff)
- **Inventory Management** — Add, edit, and track pharmaceutical products with expiry and stock levels
- **Stock Movements** — Full audit trail of inventory changes
- **Supplier Management** — Manage supplier records and relationships
- **Purchase Orders & Receipts** — Create purchase orders and reconcile them against receipts
- **Distribution Tracking** — Track outgoing distribution of stock
- **Analytics Dashboard** — Visual charts and reporting via Chart.js
- **PDF Export** — Generate PDF reports (jsPDF / PDFKit)
- **AI Assistant** — Integrated Google Gemini-powered assistant ("Maomao AI") for inventory insights
- **API Documentation** — Swagger/OpenAPI docs for the backend

## Tech Stack

**Backend**
- Node.js + Express 5
- MongoDB + Mongoose
- JWT authentication, bcrypt password hashing
- Joi request validation
- express-rate-limit for API protection
- Swagger for API docs
- Jest + Supertest for testing

**Frontend**
- React 19 + Vite
- React Router
- Tailwind CSS
- Chart.js
- Axios
- Framer Motion (`motion`)

## Project Structure

```
project/
├── ApothecaryShopserver/     # Express backend API
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── validation/
│   ├── tests/
│   └── server.js
└── ApothecaryShopUI/         # React frontend
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── services/
    │   └── context/
    └── index.html
```

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local instance or a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster)

### 1. Clone the repo
```bash
git clone https://github.com/talha147-h/Color-Palette.git
cd Color-Palette/project
```

### 2. Backend setup
```bash
cd ApothecaryShopserver
cp .env.example .env
```
Fill in `.env`:
```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/apothecary-shop
JWT_SECRET=your-secret-key-here
AI_API_KEY=your-google-gemini-api-key
```
Install and run:
```bash
npm install
npm run dev
```
Server runs on `http://localhost:5000`.

### 3. Frontend setup
```bash
cd ../ApothecaryShopUI
cp .env.example .env
```
Set in `.env`:
```
VITE_API_URL=http://localhost:5000/api
```
Install and run:
```bash
npm install
npm run dev
```
App runs on `http://localhost:5173`.

### 4. Create an account
Register through the UI. New accounts default to a non-admin role — promote a user to admin directly in MongoDB if you need admin access:
```js
db.users.updateOne({ email: "you@example.com" }, { $set: { role: "admin" } })
```

## Running Tests
```bash
cd ApothecaryShopserver
npm test
```

## API Documentation
Once the backend is running, Swagger docs are available at:
```
http://localhost:5000/api-docs
```

## Environment Variables Reference

| Variable | Location | Description |
|---|---|---|
| `PORT` | server | Backend server port (default 5000) |
| `MONGO_URI` | server | MongoDB connection string |
| `JWT_SECRET` | server | Secret used to sign JWT tokens |
| `AI_API_KEY` | server | Google Gemini API key for AI assistant features |
| `RATE_LIMIT_MAX` | server | Max requests per IP per window |
| `VITE_API_URL` | UI | Base URL the frontend uses to reach the backend API |

## License
This project is provided as-is for educational/internal use.
