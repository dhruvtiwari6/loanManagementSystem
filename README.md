# CreditSea Loan Management System

A production-ready full-stack Loan Management System where borrowers can apply for loans through a multi-step eligibility wizard, and operations teams can manage the loan lifecycle across specialized stages (Sales, Sanction, Disbursement, and Collections).

---

## Technical Stack

- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS, Lucide React Icons
- **Backend**: Node.js, Express, TypeScript, Multer (Document Uploads)
- **Database**: MongoDB Atlas (Cloud Database), Mongoose ODM
- **Authentication**: JWT, bcrypt hashing, Role-Based Access Control (RBAC)

---

## Project Structure

```
Creditsea-Assignment/
├── client/                 # Next.js Frontend Application
│   ├── src/
│   │   ├── app/            # App Router pages (borrower, dashboard, login)
│   │   └── utils/          # apiRequest helper utility
│   ├── .env.example
│   └── package.json
├── server/                 # Express.js Backend API
│   ├── src/
│   │   ├── config/         # Database connection logic
│   │   ├── controllers/    # API Controllers
│   │   ├── middlewares/    # Authentication, RBAC, and Multer upload guards
│   │   ├── models/         # Mongoose Schemas (User, Loan, Payment)
│   │   ├── routes/         # Express Router definitions
│   │   ├── utils/          # BRE and Loan Math engine logic
│   │   ├── index.ts        # Server entry point
│   │   └── seed.ts         # Database seeding script
│   ├── .env.example
│   └── package.json
└── README.md               # Main setup & usage documentation
```

---

## Getting Started

### 1. Setup Environment Variables

Create `.env` files in both the `client/` and `server/` directories:

#### Backend (`server/.env`):
```ini
PORT=5000
MONGODB_URI=your-mongodb-atlas-connection-string
JWT_SECRET=your-secure-jwt-secret-key
```

#### Frontend (`client/.env`):
```ini
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 2. Install Dependencies

Install packages in both directories:
```bash
# Install Server dependencies
cd server && npm install

# Install Client dependencies
cd ../client && npm install
```

### 3. Initialize & Seed Database

Initialize the database with the pre-seeded testing accounts:
```bash
cd ../server
npm run seed
```

### 4. Run the Application

Start both servers in development mode:

```bash
# Terminal 1: Run Express Server
cd server
npm run dev

# Terminal 2: Run Next.js Frontend
cd client
npm run dev
```

---

## Test Accounts & Credentials

Use the following pre-seeded accounts to evaluate the role-based workflows:

| Portal / Module | Email | Password | Role Purpose |
| :--- | :--- | :--- | :--- |
| **Borrower Portal** | `borrower@creditsea.com` | `Borrower@123` | Apply for loans, calculate EMI, upload salary slips |
| **Admin Panel** | `admin@creditsea.com` | `Admin@123` | Full visibility across all 4 operational tabs |
| **Sales Leads** | `sales@creditsea.com` | `Sales@123` | View registered leads who have not yet submitted a loan |
| **Sanctions Tab** | `sanction@creditsea.com` | `Sanction@123` | Approve or reject pending applications with a reason |
| **Disbursements Tab**| `disburse@creditsea.com` | `Disburse@123` | Release funds for approved applications |
| **Collections Tab** | `collect@creditsea.com` | `Collect@123` | Record repayments using unique UTR numbers |

---

## Key Design & Implementation Decisions

1. **Server-Side BRE**: Pre-eligibility checks run entirely on the server to prevent client-side tampering, returning specific error details for unmatched rules.
2. **Simple Interest Calculation**: Loan math computes interest based on standard annualized rates using $\frac{P \times R \times T}{365}$ precision.
3. **Double-Ended RBAC**: Routes are guarded using specific Express role middlewares, while Next.js routes check decoded tokens on the client to block unauthorized views.
4. **Self-Closing Collections**: Once total recorded payments match total repayment, the loan transitions to `Closed` with timestamp records.
