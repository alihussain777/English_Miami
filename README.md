# EnglishMiami 🌴
> **Learn English From Zero to Fluent (A0 to C2)**
> The next-generation full-stack AI English learning academy designed for learners worldwide.

---

## 🌟 Overview

**EnglishMiami** is a complete, production-ready, full-stack educational SaaS platform that takes language learners from **absolute beginner (A0)** all the way to **native proficiency (C2)**. Engineered specifically for non-native English speakers across Latin America, China, India, Pakistan, Bangladesh, the Middle East, Southeast Asia, Europe, and beyond.

EnglishMiami combines cutting-edge generative AI (**Google Gemini**), cognitive science (**SuperMemo SM-2 Spaced Repetition**), the **Web Speech API** for voice recognition & speech synthesis, and the **Common European Framework of Reference for Languages (CEFR)**.

---

## 🚀 Key Features

1. **CEFR Standardized Curriculum (A0 to C2)**
   - **A0 Absolute Zero**: Alphabet, phonics, numbers, survival greetings.
   - **A1 Beginner**: Introductions, family, food, daily routines, present simple.
   - **A2 Elementary**: Travel, airports, hotels, past tense, future plans.
   - **B1 Intermediate**: Workplace English, storytelling, conditionals, reported speech.
   - **B2 Upper Intermediate**: Debates, executive communication, idioms, natural discussions.
   - **C1 Advanced**: Rhetorical inversions, academic precision, diplomatic nuance.
   - **C2 Proficiency**: Near-native command, irony, cultural idioms, linguistic mastery.

2. **Mandatory Post-Lesson Vocabulary Assessment**
   - After completing each lesson, an immediate **8–10 question vocabulary test** is triggered.
   - Results are graded in real-time with mistake explanations.
   - Tested words are scheduled in the user's **Spaced Repetition (SM-2)** memory bank.

3. **Miami AI Coach**
   - Powered by Google Gemini with resilient pedagogical fallbacks.
   - **Chat Tutor**: Adaptive Q&A calibrated to student CEFR level and native language.
   - **Grammar Doctor**: Instant sentence diagnosis (*"I have went..."* → *"I went..."* with in-depth structural explanations).
   - **Vocab Coach**: Word discovery with phonetics, definitions, examples, and collocations.
   - **Voice Roleplay Simulator**: Real-time scenarios (Job Interview, Restaurant, Airport Check-in, Hotel Concierge, Doctor Visit, Shopping, Socializing).
   - **End-of-Session Evaluation Report**: Fluency rating, grammar polish, and native phrasings.

4. **Dedicated Interactive Practice Labs**
   - **Speaking Lab**: Daily challenges, Read Aloud with live browser speech recognition and accuracy scoring.
   - **Listening Lab**: Audio conversations and comprehension tests with variable speed controls (0.8x, 1.0x, 1.2x).
   - **Reading Lab**: Graded articles with interactive clickable word glosses and "Save to Vocabulary" functionality.
   - **Writing Lab**: Cambridge/IELTS-style AI essay evaluator with grammar grading, CEFR band calculation, and polished rewrites.
   - **Grammar Mastery**: Categorized lessons and mastery quizzes with instant XP rewards.
   - **Vocabulary Bank**: Spaced Repetition flashcards with SuperMemo SM-2 memory intervals.

5. **Diagnostic Placement Test**
   - 12+ multi-skill adaptive questions testing vocabulary, grammar, reading, and sentence structure.
   - Calculates exact CEFR rating, skill percentage breakdown, strengths, weak areas, and recommended study path.

6. **Gamification & Verifiable Certificates**
   - XP points, daily streak counters, achievement badges, and weekly learning velocity charts.
   - Official milestone completion certificates with unique verification IDs (`MIA-YYYY-LEVEL-XXXX`) and public verification portal (`/verify-certificate`).

7. **Flexible Subscription & Billing Architecture**
   - **Free Starter**: A0 & A1 courses, basic AI coaching, daily practice limits.
   - **Weekly Pro ($6.99/week)**: Full A0–C2 access, expanded AI messages, speaking lab, roleplay scenarios.
   - **Monthly Pro ($19.99/month)**: Unlimited AI voice coaching, IELTS/Cambridge writing evaluations, verifiable certificates.
   - PCI-DSS compliant checkout architecture with billing history and one-click cancellation.

8. **Administration Console**
   - Institutional KPI telemetry: Total students, active learners, paid subscriptions, revenue breakdown, lesson completions, and average exam scores.
   - Learner management and curriculum telemetry.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router, React 18, TypeScript)
- **Styling**: Tailwind CSS with custom Miami theme palette, 3D button animations, and dark mode
- **Database**: SQLite (local development) / PostgreSQL (production ready) via **Prisma ORM**
- **Authentication**: Custom JWT session architecture with `jose`, `bcryptjs`, and HTTP-only cookies
- **AI Integration**: Google Generative AI SDK (`@google/generative-ai`)
- **Speech & Voice**: Web Speech Recognition API (STT) and Web SpeechSynthesis API (TTS)
- **Audio Feedback**: Pure Web Audio API synthesizer for chimes, fanfares, and buzzers (zero external assets required)
- **Icons**: Lucide React

---

## 📂 Project Structure

```
english-miami/
├── prisma/
│   └── schema.prisma          # Database schema (Users, Courses, Lessons, Vocab, Tests, etc.)
├── scripts/
│   └── seed.mjs               # Complete A0-C2 curriculum, demo accounts, and placement questions
├── src/
│   ├── app/
│   │   ├── api/               # Secure server-side REST API handlers
│   │   │   ├── admin/         # Admin metrics & user management
│   │   │   ├── ai/            # Gemini AI Coach, roleplay, writing & pronunciation
│   │   │   ├── auth/          # Register, login, me, logout, forgot/reset password
│   │   │   ├── certificates/  # Issuance & public verification
│   │   │   ├── courses/       # Curriculum & lesson queries
│   │   │   ├── grammar/       # Grammar topics & mastery quizzes
│   │   │   ├── labs/          # Speaking, listening, and reading endpoints
│   │   │   ├── lessons/       # Lesson details, completion & post-lesson vocab tests
│   │   │   ├── placement-test/# Diagnostic test scoring & CEFR calculation
│   │   │   ├── subscriptions/ # Plan upgrades, checkout & billing history
│   │   │   └── vocabulary/    # Spaced repetition (SM-2) engine & custom words
│   │   ├── about/             # Mission & pedagogical framework
│   │   ├── admin/             # Admin management dashboard
│   │   ├── ai-coach/          # Miami AI Coach multi-mode interface
│   │   ├── certificates/      # User certificate vault & printable viewer
│   │   ├── contact/           # Contact form with secure database storage
│   │   ├── cookie-policy/     # Cookie and session policy
│   │   ├── courses/           # CEFR curriculum catalog (A0 to C2)
│   │   ├── dashboard/         # Learner dashboard with stats & quick actions
│   │   ├── forgot-password/   # Password recovery request
│   │   ├── grammar/           # Grammar mastery interactive modules
│   │   ├── lessons/[slug]/    # Interactive lesson player & post-session vocab assessment
│   │   ├── listening/         # Audio listening comprehension lab
│   │   ├── login/             # Sign in with 1-click demo buttons
│   │   ├── onboarding/        # 5-step interactive onboarding wizard
│   │   ├── placement-test/    # Diagnostic CEFR placement test
│   │   ├── pricing/           # Subscription plans, checkout modal & billing history
│   │   ├── privacy/           # International privacy policy
│   │   ├── profile/           # User settings, native language & daily goals
│   │   ├── reading/           # Graded articles with interactive glosses
│   │   ├── refund/            # 14-day refund & cancellation policy
│   │   ├── reset-password/    # Password reset submission
│   │   ├── signup/            # Account registration
│   │   ├── speaking/          # Speaking Lab with speech recognition accuracy
│   │   ├── terms/             # Terms of service
│   │   ├── verify-certificate/# Public certificate verification portal
│   │   ├── writing/           # Cambridge/IELTS writing grader lab
│   │   ├── globals.css        # Miami styles, 3D button utility classes & theme variables
│   │   ├── layout.tsx         # Root layout with SEO metadata & theme provider
│   │   └── page.tsx           # High-converting landing page
│   ├── components/
│   │   ├── DashboardSidebar.tsx # Responsive desktop sidebar & mobile bottom bar
│   │   ├── Footer.tsx         # Multi-column footer with curriculum & legal links
│   │   ├── Navbar.tsx         # Navigation with omni-search modal & user menu
│   │   ├── SpeechRecognitionButton.tsx # Web Speech API voice recording button
│   │   ├── TextToSpeechButton.tsx      # Native pronunciation audio player
│   │   └── ThemeProvider.tsx  # Light / Dark mode toggle provider
│   ├── lib/
│   │   ├── audio-feedback.ts  # Web Audio API chime, error, and fanfare synthesizers
│   │   ├── auth.ts            # JWT authentication & password hashing
│   │   ├── gemini.ts          # Google Gemini AI services & fallbacks
│   │   ├── prisma.ts          # Singleton Prisma client
│   │   ├── srs.ts             # SuperMemo SM-2 spaced repetition algorithm
│   │   └── subscription-gates.ts # Centralized feature access controls
│   └── types/
│       └── index.ts           # TypeScript interfaces & types
├── .env.example               # Template environment configuration
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

---

## ⚙️ Installation & Setup

### 1. Clone & Install Dependencies
```bash
cd english-miami
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Inside `.env`:
```env
DATABASE_URL="file:./dev.db"
AUTH_SECRET="english-miami-ultra-secure-jwt-secret-key-production-32chars"
GEMINI_API_KEY="" # Optional: paste your Google Gemini API Key here for live LLM responses
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
PAYMENT_SECRET_KEY="sk_test_englishmiami_secret_key"
PAYMENT_WEBHOOK_SECRET="whsec_englishmiami_webhook_key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Initialize Database & Seed Curriculum
```bash
# Push Prisma schema to SQLite
npx prisma db push

# Seed complete A0-C2 curriculum, demo accounts, and diagnostic questions
npm run prisma:seed
```

### 4. Start Local Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🔑 Demo Accounts (Pre-seeded)

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Demo Student** | `student@englishmiami.com` | `miami123456` | Level B1, Weekly Pro Plan, 620 XP, 5-Day Streak |
| **Demo Admin** | `admin@englishmiami.com` | `miami123456` | Director, Monthly Pro, full access to `/admin` telemetry |

*Note: You can also register a new account anytime at `/signup` to experience the 5-step onboarding wizard.*

---

## 🧠 Gemini AI Configuration

1. Visit [Google AI Studio](https://aistudio.google.com/) to obtain a free Gemini API key.
2. Add the key to `.env`:
   ```env
   GEMINI_API_KEY=AIzaSy...
   ```
3. Restart the server. The application will immediately utilize `gemini-1.5-flash` for high-speed, structured tutoring, grammar diagnosis, and roleplay simulations!
4. *Graceful Fallback*: If no API key is provided, the platform automatically engages its built-in pedagogical heuristic engine, allowing all features to be tested seamlessly without any credentials.

---

## 💳 Payment & Subscriptions Setup

1. The platform includes a centralized subscription gate (`src/lib/subscription-gates.ts`).
2. Supported plans:
   - **FREE**: Includes A0 and A1 courses, basic AI chat, daily limits.
   - **WEEKLY_PRO ($6.99/week)**: Full A0–C2 access, roleplay scenarios, writing feedback.
   - **MONTHLY_PRO ($19.99/month)**: Unlimited everything, official certificates, priority speed.
3. For Stripe integration in production:
   - Set `PAYMENT_SECRET_KEY` with your Stripe secret key (`sk_live_...`).
   - Configure your Stripe webhook to point to `/api/subscriptions/webhook` with `PAYMENT_WEBHOOK_SECRET`.

---

## 🧪 Production Build & Deployment

To generate an optimized production build:
```bash
npm run build
npm run start
```

### Vercel / Cloud Deployment
1. Connect your Git repository to Vercel, Railway, or AWS.
2. In production, change the Prisma datasource in `prisma/schema.prisma` from `sqlite` to `postgresql` if utilizing a hosted Postgres instance:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
3. Set your production environment variables in your deployment dashboard.
4. Run `npx prisma db push && node scripts/seed.mjs` during the build step.

---

## 📜 License & Accreditation

© 2026 EnglishMiami Technologies Inc. Built with care for curious global minds everywhere.
All curriculum modules align with the official CEFR (Common European Framework of Reference for Languages) standards.
