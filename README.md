# Profit Pulse — Team Allocation Platform

Full-stack React app connected to Supabase. Deploy to Vercel in minutes.

---

## Project Structure

```
profit-pulse/
├── index.html          ← Entry HTML
├── vite.config.js      ← Vite config
├── package.json        ← Dependencies
└── src/
    ├── main.jsx        ← React entry point
    └── App.jsx         ← Full platform (all 9 pages)
```

---

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Run dev server
npm run dev

# 3. Open http://localhost:5173
```

---

## Deploy to Vercel

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit — Profit Pulse platform"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/profit-pulse.git
git push -u origin main
```

### Step 2 — Connect to Vercel

1. Go to https://vercel.com
2. Click **Add New Project**
3. Import your GitHub repo
4. Framework: **Vite**
5. Click **Deploy**

That's it — Vercel auto-detects Vite. No environment variables needed (Supabase credentials are in App.jsx).

---

## Create Your First Admin User

After deploying, you need to create your admin account in Supabase:

1. Go to your Supabase project → **Authentication → Users**
2. Click **Add User → Create New User**
3. Enter your email and password
4. Click **Create User**
5. Then go to **SQL Editor** and run:

```sql
UPDATE public.profiles 
SET role = 'admin', full_name = 'Your Name'
WHERE email = 'your@email.com';
```

6. Now log in to your deployed app with those credentials

---

## Supabase Details

- **Project:** Team Allocation
- **URL:** https://hmvlgesnxaqebfdzizmy.supabase.co
- **Region:** Northeast Asia (Tokyo)

---

## Pages

| Page | Description |
|------|-------------|
| Dashboard | Financial KPIs, charts, team utilization |
| Employees | Team roster, costs, department allocation |
| Clients | Client portfolio management |
| Contracts | Contract values, budgets, renewals |
| Allocations | Monthly hour allocations per employee/client |
| Reports | Profit analysis, cash flow, risk, utilization |
| Monthly Close | Lock historical financial data |
| Contract Expenses | Track project expenses with profit calculation |
| System Users | User management and role permissions |
