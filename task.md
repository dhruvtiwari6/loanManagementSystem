# Loan Management System Full-Stack Assignment

MERN • Next.js • TypeScript


## 1. What to Build

Build a Loan Management System — a lending platform where borrowers apply for loans and internal executives manage those loans through their lifecycle.

## Two main parts:

- Borrower Portal — A multi-step application form ending with a loan request.

- Operations Dashboard — Internal panel with 4 modules for different teams, guarded by role-based access.

## Tech Stack:

- Frontend: Next.js (App Router) + TypeScript + Tailwind CSS

- Backend: Node.js + Express.js + TypeScript

- Database: MongoDB + Mongoose

- Auth: JWT + bcrypt

## 2. Borrower Journey

## Step 1 — Authentication

Sign up and login flow. Passwords must be hashed. Protect all other pages.

## Step 2 — Personal Details + Eligibility Check

Collect: Full Name, PAN, Date of Birth, Monthly Salary, Employment Mode (Salaried / Self-Employed / Unemployed).

Run a Business Rule Engine (BRE) on the server. Reject if:

| Rule Age |   | Not between 23 and 50 |   |   | Rejection Condition |   |   |   |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Salary |   | Below ■25,000 / month |   |   |   |   |   |   |


| PAN | Does not match valid PAN format |
| --- | --- |
| Employment | Applicant is Unemployed |

If any rule fails block the application. Show clear error. All checks must pass.

Think about: what's the correct PAN regex? Should BRE live on the client, server, or both? Why?

## Step 3 — Upload Salary Slip

File upload — accept PDF/JPG/PNG, max 5 MB. Store and link to the application.

## Step 4 — Loan Configuration & Apply

User picks Loan Amount (■50K – ■5L) and Tenure (30 – 365 days) using sliders. Interest rate is fixed at 12% p.a.

Show a live calculation panel that updates as sliders move. Use Simple Interest:

On clicking "Apply" loan is created with a pending status.

## 3. Operations Dashboard

## Dashboard Modules

The dashboard has 4 modules, each tied to a stage in the loan lifecycle. Think about what data each module needs to show and what actions are available.

## Sales

Handles the pre-application stage — users who've registered but haven't applied yet. Think of it as lead tracking.

## Sanction

Handles applied loans. The sanction executive reviews and either approves or rejects (with a reason). Figure out: what status transitions happen here?

## Disbursement

Handles approved/sanctioned loans. The executive marks a loan as disbursed (funds released). What should the next status be?


## Collection

Handles active (disbursed) loans. The executive records borrower payments. Each payment needs:

- UTR Number — must be unique across all payments (no duplicates).

- Amount and Date.

When total amount paid equals total repayment loan should auto-close.

Think about: how do you track outstanding balance? What validations should you add on payment amount?

## 4. Role-Based Access Control

The system has these roles: Admin, Sales, Sanction, Disbursement, Collection, Borrower.

- Each executive role can access only their own module on the dashboard.

- Admin can access all modules.

- Borrowers can only access the application portal, not the dashboard.

- Enforce access control on both frontend AND backend. Hiding a menu item is not enough — the API must also reject unauthorized requests.

Create a seed script that pre-creates one account per role with known credentials so the evaluator can log in and test each role immediately.

Design decisions are on you: how will you store roles? How will middleware check them? What HTTP status do you return for unauthorized access?

## 5. What You Need to Design Yourself

This assignment intentionally does not hand you the database schemas, API contracts, or folder structure. Designing those is part of the evaluation. Think through the data model, relationships, status transitions, and REST endpoints yourself.

You are expected to decide:

- What MongoDB collections you need and how they relate to each other.

- What fields each collection needs (think about all the data flowing through the system).

- Your full REST API design — routes, methods, request/response shapes, status codes.

- How you structure authentication middleware and RBAC middleware.

- How loan status transitions work (what are the valid states? who can trigger each transition?).

- Your project folder structure — keep it clean and logical.

## 6. Submission


Submit these three things:

## 1. GitHub Repo

Public or private (add evaluator). Include a README with setup instructions and a .env.example.

## 2. Working Video (3–5 min)

Screen recording showing the complete flow: borrower applies (including BRE pass & fail) executive approves disburses payment recorded loan closes. Upload to YouTube (unlisted) or Google Drive.

## 3. Login Credentials

For all roles — so the evaluator can test directly without creating accounts.

## Evaluation Focus:

| Area | Weight |
| --- | --- |
| End-to-end working flow | 35% |
| Code quality + TypeScript | 20% |
| Correct BRE + loan math | 15% |
| RBAC (frontend + backend) | 15% |
| UI/UX + responsiveness | 10% |
| README + repo hygiene | 5% |

Get the core flow working end-to-end first. A complete basic system always scores higher than a half-built one with extras. Good luck!