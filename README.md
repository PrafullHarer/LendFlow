<div align="center">
  <img src="public/logo.svg" alt="LendFlow Logo" width="140" />
  <h1>LendFlow — Smart Loan Manager</h1>
  <p><b>A full-stack, Neubrutalist-themed loan and borrower tracking platform. Built with Next.js 14, MongoDB, and Tailwind CSS to autonomously map amortization schedules and chronological system transactions.</b></p>
  <br/>
  
  ![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square) 
  ![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=flat-square) 
  ![Tailwind](https://img.shields.io/badge/Tailwind-CSS-blue?style=flat-square) 
  ![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=flat-square)
</div>

---

## Features

- 🔐 **Secure Auth** — Custom JWT in HTTP-only cookies
- 📊 **Dashboard** — Summary cards, upcoming payments, quick mark-as-paid
- 👥 **Borrower Management** — Add, view, delete borrowers with auto-generated payment schedules
- 📅 **Payment Schedule** — Track interest-only and final (interest + principal) payments
- 📜 **History** — Full payment history with filters (status, date range, search)
- 🗃️ **System Activity Logs** — Advanced timeline tracking all creations, updates, and loan closures
- 🎨 **Neubrutalist UI** — Fully responsive, high-contrast, border-heavy aesthetic (Mobile & Desktop dock navigation)
- 🚀 **Vercel Ready** — Deploy in one click

---

## Lending Logic

When a loan is created:
- **Monthly interest** = Principal × Rate% / 100
- **Months 1 to Y-1**: Borrower pays monthly interest only
- **Month Y (final)**: Borrower pays monthly interest + full principal
- **Total repayment** = (Monthly interest × Y) + Principal
- Due dates follow the start date (e.g., started 5th → due 5th each month)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) |
| Styling | Tailwind CSS (Neubrutalism) |
| Backend | Next.js API Routes |
| Database | MongoDB Atlas (Mongoose) |
| Auth | Custom JWT Authentication |
| Icons | lucide-react |
| Deploy | Vercel |

---

## Setup

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd intrest
npm install
```

### 2. Set up MongoDB Atlas

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a free cluster
3. Create a database user
4. Whitelist your IP (or `0.0.0.0/0` for Vercel)
5. Get your connection string

### 3. Configure Environment

Create `.env.local` in the project root:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lendflow?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_minimum_32_chars
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and login with your admin credentials.

---

## Deploy to Vercel

### One-Click Deploy

1. Push your code to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your repository
4. Add environment variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`
5. Deploy!

### Important Notes
- Make sure MongoDB Atlas allows connections from `0.0.0.0/0` (for Vercel's dynamic IPs)
- Use a strong JWT_SECRET (minimum 32 characters)

---

## Database Schema

### Borrower
| Field | Type | Description |
|-------|------|-------------|
| name | String | Borrower's full name |
| phone | String | Phone number (optional) |
| principal | Number | Loan amount (₹) |
| interestRate | Number | Monthly interest rate (%) |
| durationMonths | Number | Loan duration |
| startDate | Date | Loan start date |
| status | Enum | 'active' or 'closed' |

### Payment
| Field | Type | Description |
|-------|------|-------------|
| borrowerId | ObjectId | Reference to Borrower |
| dueDate | Date | Payment due date |
| monthNumber | Number | 1 to Y |
| amountDue | Number | Amount expected |
| amountPaid | Number | Amount actually paid |
| paidOn | Date | Date payment was made |
| type | Enum | 'interest' or 'final' |
| status | Enum | 'pending', 'paid', or 'overdue' |

### Log
| Field | Type | Description |
|-------|------|-------------|
| action | String | Type of event (e.g. 'Borrower Added') |
| details | String | Formatted description block |
| timestamp | Date | Timestamp of system activity execution |

---

## Pages

| Route | Description |
|-------|-------------|
| `/login` | High-contrast login portal |
| `/dashboard` | System overview, logs modal, and upcoming payments |
| `/borrowers` | List all borrowers with add new |
| `/borrowers/[id]` | Borrower detail with dynamic timeline |
| `/history` | Full payment history and transaction filters |

---

## Author

**Prafull Harer**  
Designed and engineered as a full-stack financial tracking application utilizing modern Next.js methodologies and Neubrutalist design principles.

---

## License

MIT
