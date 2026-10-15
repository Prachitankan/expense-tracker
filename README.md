# 💰 SpendWise - Smart Expense & Savings Tracker

A modern, full-stack Expense and Savings Tracker built with **React**, **Node.js/Express**, and **MongoDB (Mongoose)**. Features proactive spending limit alerts, monthly saving target appraisals with celebratory confetti, dynamic budgeting, and a clean, user-friendly UI designed for first-time and advanced users alike.

---

## ✨ Key Features

1. **🔐 Authentication & Protected Access**:
   - Secure Register & Login with encrypted passwords (`bcryptjs`) and JSON Web Tokens (`JWT`).
   - Only logged-in users can view, manage, and track personal expenses and analytics.
   - Session persistence with instant sign-in and sign-out.

2. **🎯 Financial Budget Configuration & Onboarding**:
   - During registration, the user enters their **Monthly Income** and **Monthly Saving Target**.
   - Currency selection (₹ INR, $ USD, € EUR, £ GBP, ¥ JPY, etc.).
   - Quick preset chips and percentage selectors (10%, 20%, 30%, 50%).
   - Live preview of calculated **Monthly Spending Limit**:
     $$\text{Spending Limit} = \text{Monthly Income} - \text{Monthly Saving Target}$$
   - **Edit Details Feature**: Easily update Monthly Income, Saving Target, Currency, or Name anytime via the **Edit Budget** settings modal.

3. **🚨 Intelligent Alerts & Appraisals Section**:
   - **Spending Limit Alert (Warning / Danger)**:
     - Prominently shown in the dedicated Alerts section.
     - Triggers an instant warning when monthly expenses reach $\ge 85\%$ of the spending limit.
     - Triggers an alert when expenses meet or exceed the spending limit ($\ge 100\%$).
   - **Savings Target Appraisal (Congratulatory Milestone)**:
     - When the user successfully preserves their savings goal ($\text{Current Savings} \ge \text{Monthly Saving Target}$), an Appraisal Card is generated with badge recognition (**Savings Champion 🏆**).
     - Celebratory confetti automatically bursts to reward financial discipline!
   - Dismissible alerts with real-time sync.

4. **📊 Comprehensive Financial Overview (KPIs)**:
   - **Monthly Income**: Quick view with edit shortcut.
   - **Spending Limit**: Visual progress bar tracking limit consumption (Green $\rightarrow$ Yellow $\rightarrow$ Red).
   - **Total Expenses**: Real-time spending tally and transaction count.
   - **Current Savings & Goal**: Progress tracker toward your monthly savings target.

5. **🧾 Expense Management & Transactions**:
   - Add new expenses with category, payment method (UPI, Card, Cash, Net Banking), date, amount, and notes.
   - Quick-add amount chips (+100, +500, +1000, +2000).
   - Edit and delete existing expenses.
   - Filter by Month & Year, filter by Category, and live search by title or note.
   - One-click **Export to CSV** for reports.
   - **Clean Database by Default**: 0 hardcoded records in the database.
   - Optional **"Try Example Data"** button to load 5 realistic sample transactions on demand, and **"Clear All"** to reset cleanly.

6. **📈 Category Spending Breakdown**:
   - Multi-segment visual distribution bar with custom category colors.
   - Category item cards with icons, amounts, and percentage shares.

---

## 🛠️ Architecture & Tech Stack

- **Frontend**: React 19, Vite, Lucide Icons, Canvas-Confetti, Modern Vanilla CSS (Glassmorphism, CSS variables, responsive design).
- **Backend**: Node.js, Express, JWT, Bcryptjs, CORS, Dotenv.
- **Database**: MongoDB via Mongoose.
  - Supports MongoDB Atlas or local MongoDB daemon via `MONGO_URI`.
  - Built-in zero-setup fallback to `MongoMemoryServer` so the app works out of the box without requiring manual database installations.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18 or higher recommended; verified on v22).
- **npm** (comes with Node.js).

### 2. Project Structure
```
expence-tracker/
├── package.json          # Root scripts
├── server/               # Node.js + Express backend
│   ├── config/db.js      # MongoDB connection & fallback
│   ├── models/           # User & Expense Mongoose schemas
│   ├── routes/           # Auth & Expense endpoints
│   ├── middleware/       # JWT verification
│   ├── .env              # Environment config
│   └── index.js          # Server entrypoint (serves API & Frontend)
└── client/               # React + Vite frontend
    ├── src/
    │   ├── api/          # API fetch wrapper
    │   ├── context/      # AuthContext
    │   ├── components/   # Alerts, KPIs, Modals, Navbar, etc.
    │   ├── App.jsx
    │   └── App.css
    └── package.json
```

---

## 🏃 Running the Application

### Option A: Unified Production Mode (Single Command)
The server is already configured to serve the built React frontend directly!
```powershell
cd server
npm start
```
Open **[http://localhost:5000](http://localhost:5000)** in your browser.

### Option B: Development Mode (Hot-Reload)
Run server and client concurrently in two separate terminals:

**Terminal 1 (Backend):**
```powershell
cd server
npm run dev
```
*(Runs on `http://localhost:5000`)*

**Terminal 2 (Frontend):**
```powershell
cd client
npm run dev
```
*(Runs on `http://localhost:3000` with auto-proxy to backend)*

---

## ⚙️ MongoDB Configuration

Edit `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/expense_tracker
JWT_SECRET=super_secret_expense_tracker_jwt_token_2026_xyz
```
- If you have MongoDB installed or use MongoDB Atlas, paste your connection string in `MONGO_URI`.
- If no external MongoDB is running, the server automatically boots an in-memory MongoDB instance with real MongoDB semantics.
- In both cases, **no hard-coded expenses exist initially** until you register and add your transactions.

---

## 🧪 Testing the Core Logic

1. **Register**: Click **Register & Setup**, enter your name, email, password, Monthly Income (e.g. ₹60,000) and Monthly Saving Target (e.g. ₹20,000).
   - Your Spending Limit will automatically calculate to **₹40,000**.
2. **Appraisal Alert**: Since your expenses are initially ₹0, your savings are ₹60,000 (which exceeds ₹20,000). Notice the celebratory **Savings Champion 🏆** appraisal banner with confetti!
3. **Add Expenses**:
   - Click **Add Expense** and add an item of ₹25,000. Notice the spending limit bar fill to 62.5%.
   - Add another expense of ₹18,000 (total ₹43,000 > ₹40,000 limit).
4. **Exceeded Limit Alert**: Watch the alert banner instantly shift to:
   - `🚨 Monthly Spending Limit Reached or Exceeded!`
5. **Edit Budget**: Click **Edit Budget** in the top navigation, change your Monthly Income or adjust your target, and watch all alerts and limits update dynamically!
