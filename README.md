# 🏛️ BharatFix — Next-Gen Civic Governance & SLA Engine

**BharatFix** is a modern, transparent civic complaint resolution platform designed for residential societies, block supervisors, and city administrators. It features real-time incident tracking, priority-driven SLA resolution countdowns, automated multi-tier escalation, interactive analytics, and an integrated AI Chatbot Assistant.

---

## ✨ Key Features

- 🤖 **Interactive BharatFix Assistant Chatbot**: 24/7 automated FAQ guidance and live Prisma database complaint status lookup.
- ⏱️ **Automated SLA Engine**: Priority-driven resolution timelines (4h Critical, 12h High, 24h Medium, 48h Low) with automatic breach warnings and escalation.
- 📊 **Modern Glassmorphism Dashboard**: Real-time KPI stat cards, Area & Donut charts, category breakdown, and live activity timelines.
- 📋 **Complaints Queue (Grid & Table View)**: Visual complaint cards with SLA countdown bars, category icons (Water 💧, Electricity ⚡, Sanitation 🗑️, Roads ⛑️, Security 🛡️), and category filter pills.
- 🛡️ **Role-Based Authorization**:
  - **Residents**: Lodge complaints, track resolution timelines, and interact with the assistant.
  - **Block Heads**: Assigned jurisdiction queues, status update actions, and commentary logs.
  - **Admins**: System-wide oversight, user approvals, block assignments, and escalation handling.
- 🚀 **Vercel & Monorepo Ready**: Fully configured for one-click deployment on Vercel.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite, Recharts, Lucide Icons, Framer Motion, Vanilla CSS (Glassmorphic Design Tokens)
- **Backend**: Node.js, Express 5, Prisma ORM, PostgreSQL, JSON Web Tokens (JWT), BcryptJS
- **Deployment**: Vercel Serverless Functions + Static Build

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js (v18+ recommended)
- PostgreSQL database instance

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/swayam-21max/BharatFix.git
cd BharatFix

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 2. Environment Setup
Create a `.env` file in the `server/` directory:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://username:password@localhost:5432/bharatfix"
JWT_SECRET="your_super_secret_jwt_key"
```

### 3. Database Migration & Prisma Setup
```bash
cd server
npx prisma generate
npx prisma db push
```

### 4. Run Development Servers
```bash
# Start Backend Express Server (Port 5000)
cd server
npm run dev

# Start Frontend Vite Dev Server (Port 5173)
cd client
npm run dev
```

---

## ☁️ Deploying on Vercel

BharatFix is pre-configured for Vercel fullstack deployment using [`vercel.json`](./vercel.json) and [`api/index.js`](./api/index.js).

### Step-by-Step Vercel Deployment:

1. Push your repository to GitHub.
2. Go to [Vercel Dashboard](https://vercel.com/new) and click **Import Project**.
3. Select your `BharatFix` repository.
4. Set the **Framework Preset** to **Vite**.
5. Configure the following **Environment Variables** in Vercel:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection URL (e.g. Supabase / Neon / Railway) | `postgresql://...` |
| `JWT_SECRET` | Secret key for JWT authentication tokens | `your_production_secret` |
| `NODE_ENV` | Environment mode | `production` |

6. Click **Deploy**. Vercel will automatically build the React client bundle and deploy the Express API serverless functions!

---

## 📄 License
This project is licensed under the ISC License.
