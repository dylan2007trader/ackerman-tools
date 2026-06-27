# Ackerman Tools

**Live app → [ackerman-tools.vercel.app](https://ackerman-tools.vercel.app)**

A suite of AI-powered career tools for technical job seekers. The first tool is live: an AI resume grader and upgrader with a matching cover letter generator — free to try, $10/month to unlock unlimited upgrades.

---

## Features

### ✅ Live — Resume Suite
- **Free resume grader** — upload a PDF, DOCX, or TXT resume and get an AI-generated score across multiple dimensions (impact, clarity, keywords, formatting) with specific feedback tied to your target role
- **Premium resume upgrade** — AI rewrites your resume bullets and sections to be stronger, more specific, and better aligned to the role you're applying for
- **Cover letter generator** — generates a tailored cover letter based on your upgraded resume and target role
- Role picker with category/subcategory suggestions across software, data, finance, and more

### 🔜 Coming Soon
- LinkedIn Optimizer — tighten your headline, summary, and profile wording
- Project Pitch Helper — turn raw project notes into clean resume/interview-ready descriptions
- Technical Portfolio Reviewer — see what a recruiter notices first across your projects

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router v7 |
| Backend | Node.js, Express 5 |
| Database | SQLite (via `sqlite` + `sqlite3`) |
| Auth | JWT, bcrypt, email-based password reset (Resend) |
| Payments | Stripe (subscription checkout + webhooks) |
| AI | Claude API (resume grading, upgrading, cover letter generation) |
| Deployment | Vercel (frontend + serverless backend) |
| File parsing | pdfjs-dist, mammoth (DOCX) |

---

## Project Structure

```
ackerman-tools/
├── backend/
│   ├── server.js        # Express API (auth, payments, AI endpoints)
│   ├── generator.js     # Claude-powered resume upgrade + cover letter builder
│   ├── grader.js        # AI resume grader logic
│   └── package.json
├── src/
│   ├── pages/
│   │   ├── MainHubPage.js       # Landing page + tool roadmap
│   │   └── ResumeToolPage.js    # Resume grader + upgrade UI
│   ├── components/
│   │   ├── resume/              # ScoreCard, StatsGrid, ImprovementSections, PremiumUpsell
│   │   └── auth/                # AuthModal (login, signup, forgot password)
│   ├── services/
│   │   └── accountStore.js      # Auth, purchases, API calls
│   └── utils/
│       ├── roles.js             # Role categories + subcategories
│       └── resumeUpgrader.js    # Client-side resume download helpers
└── public/
```

---

## Running Locally

### Prerequisites
- Node.js 18+
- A Claude API key (Anthropic)
- A Stripe account (for payment features — optional for grader-only testing)

### 1. Clone the repo

```bash
git clone https://github.com/dylan2007trader/ackerman-tools.git
cd ackerman-tools
```

### 2. Set up the backend

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:

```env
PORT=4000
JWT_SECRET=your_jwt_secret
ANTHROPIC_API_KEY=your_claude_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_RESUME_SUITE_PRICE_ID=your_stripe_price_id
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
FRONTEND_ORIGIN=http://localhost:3000
RESEND_API_KEY=your_resend_api_key
RESET_FROM_EMAIL=you@yourdomain.com
```

Start the backend:

```bash
node server.js
# Server running at http://localhost:4000
```

### 3. Set up the frontend

```bash
cd ..
npm install
```

Create a `.env` file in the root:

```env
REACT_APP_API_URL=http://localhost:4000
```

Start the frontend:

```bash
npm start
# App running at http://localhost:3000
```

---

## Roadmap

- [x] AI resume grader (free tier)
- [x] AI resume upgrade (premium)
- [x] Cover letter generator (premium)
- [x] JWT auth + email/password reset
- [x] Stripe subscription payments
- [ ] LinkedIn Optimizer
- [ ] Project Pitch Helper
- [ ] Technical Portfolio Reviewer
- [ ] Mobile-responsive redesign

---

## Author

Dylan Ackerman · [LinkedIn](https://www.linkedin.com/in/dylan-ackerman-2015a638a/) · [dackerm2007@gmail.com](mailto:dackerm2007@gmail.com)
