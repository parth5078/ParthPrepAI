# ParthPrep AI — Study & Career Tracker

A responsive personal dashboard for college finals, GATE CS preparation, internship goals, daily tasks, and test attempts. Records are stored in MongoDB using a Node.js + Express API.

## Stack
- Frontend: HTML, CSS, vanilla JavaScript (responsive dashboard)
- Backend: Node.js + Express
- Database: MongoDB Atlas or local MongoDB
- Cost: The code is free. MongoDB Atlas and hosting providers may have free tiers, limits, and availability conditions; check their current plans.

## Run on your Dell laptop

### 1. Install Node.js
Install the current Node.js LTS version from https://nodejs.org/ and reopen your terminal. Check:
```bash
node -v
npm -v
```

### 2. Create a free MongoDB database
1. Create a MongoDB Atlas account at https://www.mongodb.com/atlas/database.
2. Create a cluster using a free/shared option if available in your account/region.
3. Create a database user with a strong password.
4. In Network Access, allow your current IP address for local development. Avoid `0.0.0.0/0` for a real deployed app unless you understand the security tradeoff.
5. Select Connect → Drivers and copy the connection string.
6. Replace the username, password, and database name in the string. If your password contains special characters, URL-encode them.

### 3. Configure the app
Open a terminal in this project folder:
```bash
npm install
```
Copy `.env.example` to `.env` (Windows PowerShell):
```powershell
Copy-Item .env.example .env
```
Edit `.env` and put your real Atlas connection string after `MONGODB_URI=`. Do not share `.env` or upload it to GitHub.

### 4. Start it
```bash
npm start
```
Open http://localhost:3000 in Chrome.

## What it currently does
- Add goals under College, GATE, or Internship
- Track progress at 0/25/50/75/100%
- Record tests with marks, percentage, and review notes
- Add and complete daily tasks
- Persist records to MongoDB (not browser localStorage)

## Important limitations before public deployment
This starter is for a single trusted user and does not yet include login/authentication, per-user data isolation, CSRF/rate-limit hardening, or production monitoring. Do not deploy it publicly with personal data until authentication and security hardening are added. Never put the MongoDB connection string in frontend code. For a public live URL, deploy the Node app to a provider with a suitable free tier (if available) and keep `MONGODB_URI` in that provider's environment variables. Hosting plans and free-tier terms can change.
