<h1 align="center">CreditSea — Experian XML Report (MERN) 📊</h1>

<p align="center">A MERN app to upload, parse, store, and view Experian soft credit-pull XML reports.</p>

<p align="center">
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB"/>
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js"/>
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React"/>
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite"/>
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=000" alt="JavaScript"/>
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=fff" alt="CSS3"/>
</p>

---

## ✨ Features

- 📤 **XML Upload (validated)** — backend accepts `.xml` files (multer) and rejects other types.  
- 🧠 **Parsing** (fast-xml-parser) — extracts:
  - **Basic Details:** Name, Mobile Phone, PAN, Bureau Score  
  - **Report Summary:** Total/Active/Closed accounts, Secured & Unsecured amounts, Enquiries (last 7 days)  
  - **Credit Accounts:** Lender, Type, Status, Open/Close dates, Limit, Current Balance, Overdue, EMI
- 💾 **Persist to MongoDB** — stores parsed report with a clean Mongoose schema.
- 🔎 **Read APIs** — fetch recent reports, latest by PAN, or by report ID.
- 🖥️ **React UI** — upload → preview → save → view a detailed report (accounts table + JSON).

> Scope: Implements **Create + Read** (no update/delete, no auth). Frontend uses plain CSS.

---

## 🛠️ Tech Stack

- **Frontend:** React (Vite), plain CSS, Fetch API  
- **Backend:** Node.js, Express, Multer, fast-xml-parser, Mongoose, CORS, dotenv  
- **Database:** MongoDB Atlas  
- **Dev:** nodemon for backend hot-reload

---

## 📁 Project Structure

```
creditsea-assignment/
  server/
    src/
      index.js
      db.js
      models/
        Report.js
    routes/
      uploadRoutes.js
      reportRoutes.js
    middlewares/
      upload.js
    utils/
      parser.js
    .env             
    package.json
  client/
    src/
      App.jsx
      api.js
      main.jsx
      index.css
    .env              
    package.json
README.md
```

---

## 🚀 Setup & Run

> Run **server** and **client** in separate terminals.

### 1) Backend (Express)

```bash
cd creditsea-assignment/server
npm install
```

Create `server/.env`:

```
PORT=5000
MONGODB_URI="mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/creditsea?retryWrites=true&w=majority&appName=<AppName>"
```

Start dev server:

```bash
npm run dev
```

Health checks:
- `http://localhost:5000/api/health`
- `http://localhost:5000/api/db/health` → `{ "connected": true, "state": 1 }`

### 2) Frontend (React + Vite)

```bash
cd ../client
npm install
```

Create `client/.env`:

```
VITE_API_URL=http://localhost:5000
```

Run:

```bash
npm run dev
```

Open **http://localhost:5173**.

---

## 🎮 How to Use

1. Open the client at **http://localhost:5173**  
2. Click **Choose File** and select an Experian `.xml`  
3. Click **Preview** to see parsed fields  
4. Click **Save to DB** to persist  
5. Use **Recent Reports** → **View** or **View now** to open the detailed report

---

## 🔌 API Reference

### Upload (preview only)
`POST /api/upload`  
**Body:** `multipart/form-data` with key **file** (XML)  
**Response (example):**
```json
{
  "ok": true,
  "topLevelRoot": "INProfileResponse",
  "sample": {
    "name": "Sagar ugle",
    "phone": 9819137672,
    "pan": "AOZPB0247S",
    "bureauScore": 719,
    "totals": {
      "totalAccounts": 4,
      "activeAccounts": 3,
      "closedAccounts": 1,
      "securedAmount": 85000,
      "unsecuredAmount": 160000,
      "enquiriesLast7Days": 0
    }
  },
  "counts": { "accounts": 4, "enquiries": 0 }
}
```

### Upload + Save
`POST /api/upload/save`  
**Body:** `multipart/form-data` with key **file** (XML)  
**Response:**
```json
{
  "ok": true,
  "reportId": "68fae4c4b944cb5dd780cb09",
  "sample": { "...": "..." },
  "counts": { "accounts": 4, "enquiries": 0 },
  "createdAt": "2025-10-24T02:30:28.544Z"
}
```

### Get recent / latest
- `GET /api/reports?limit=5` → recent N (default 10)  
- `GET /api/reports?pan=<PAN>` → **latest** for a PAN

### Get by id
- `GET /api/reports/:id`

---

## 🧱 Data Model (Mongo `reports` collection)

```js
Report {
  _id,
  rootKey: String,          // e.g., "INProfileResponse"
  file: {
    fileName: String,
    fileSize: Number,
    mimeType: String
  },
  basic: {
    name: String,
    phone: String,          // stored as string
    pan: String,
    bureauScore: Number
  },
  summary: {
    totalAccounts: Number,
    activeAccounts: Number,
    closedAccounts: Number,
    securedAmount: Number,
    unsecuredAmount: Number,
    enquiriesLast7Days: Number
    // (optional) currentBalanceTotal: Number
  },
  accounts: [{
    lender: String,
    type: String,
    status: String,
    openedOn: String,
    closedOn: String,
    creditLimit: Number,
    currentBalance: Number,
    overdue: Number,
    emi: Number,
    portfolioType: String
    // (optional) accountNumber: String, address: String
  }],
  enquiries: [{
    date: String,
    purpose: String,
    amount: Number
  }],
  createdAt, updatedAt
}
```

---

## Screenshots

<p align="center">
  <img src="./assets/Screenshot 2025-10-24 080922.png" alt="Report Details screen" width="48%" />
  <img src="./assets/Screenshot 2025-10-24 080910.png" alt="Upload & Save screen" width="48%" />

</p>


---

## 🧪 CURL Examples (Windows Git Bash)

```bash
# Preview
curl -X POST http://localhost:5000/api/upload   -F "file=@C:/Users/<you>/Downloads/Sample.xml"

# Save
curl -X POST http://localhost:5000/api/upload/save   -F "file=@C:/Users/<you>/Downloads/Sample.xml"

# Recent 5
curl "http://localhost:5000/api/reports?limit=5"

# By id
curl http://localhost:5000/api/reports/<reportId>
```

