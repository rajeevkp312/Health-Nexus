# HealthNexus7 – Healthcare Management System

HealthNexus7 is a full‑stack healthcare management platform with separate portals for **Admin**, **Doctor**, and **Patient** users, plus an AI‑powered **HealthBot** assistant.

This README gives you a single place to understand the project, set it up, and run it. For deep dives, see the additional docs listed at the end.

---

## Features

- **Admin Portal**
  - Doctor management (CRUD, images, availability, fees)
  - Patient management (status tracking, medical info)
  - Appointment management (Scheduled → Confirmed → Completed → Cancelled)
  - News & content management with images
  - Feedback / enquiries and basic analytics dashboard

- **Doctor Portal**
  - View/manage appointments by status
  - Access patient information
  - Manage medical reports
  - Manage doctor profile with persistent profile photo

- **Patient Portal**
  - Register & login with OTP email verification
  - Request and view appointments
  - View lab/medical reports
  - Submit feedback and manage profile

- **Authentication System**
  - Unified auth with JWT tokens
  - Email‑OTP based registration and password reset
  - Role‑based access (patient / doctor, admin via separate system)

- **HealthBot (Chatbot)**
  - GPT‑powered assistant for:
    - Booking / requesting appointments
    - Finding doctors by speciality
    - Navigating to lab reports and patient portal
    - Emergency info and general health guidance
  - Floating chat widget with quick actions and conversation history

---

## Tech Stack

- **Frontend**: React + Vite, React Router, Tailwind CSS, shadcn‑style components, Lucide icons, React Query
- **Backend**: Node.js, Express, MongoDB, Mongoose, Multer, Nodemailer / Resend, OpenAI SDK
- **Auth & Security**: JWT, bcryptjs, OTP verification, validation & error handling

---

## Project Structure

```text
healthNexus7/
├─ backend/                 # Express + MongoDB REST API
├─ frontend/                # React SPA (Admin / Doctor / Patient portals + landing)
├─ node_modules/            # Root dependencies (if any)
├─ AUTH_README.md           # Detailed authentication system documentation
├─ CHATBOT_README.md        # HealthBot / chatbot integration details
├─ IMPLEMENTATION_SUMMARY.md# High‑level summary of delivered features
├─ PROFILE_PHOTO_FIX.md     # Notes on doctor profile photo persistence fix
├─ QUICK_TEST_GUIDE.md      # Very fast way to test auth from the UI
├─ SETUP_GUIDE.md           # Extended setup + deployment notes
├─ package.json             # Root project metadata
└─ README.md                # You are here
```

The main application code lives in **`backend/`** and **`frontend/`**.

---

## Prerequisites

- Node.js **v18+** (recommended)
- MongoDB running locally or a MongoDB connection string
- Git

---

## Backend Setup (`backend/`)

```bash
cd backend
npm install
```

Create a `.env` file (you can base it on `.env.example` if present):

```env
MONGODB_URI=mongodb://127.0.0.1:27017/healthnexus7
JWT_SECRET=your_jwt_secret_key_here
OPENAI_API_KEY=your_openai_api_key_here   # For HealthBot
EMAIL_USER=your_email@gmail.com           # Or provider user
EMAIL_PASS=your_app_password_here         # App password / SMTP secret
PORT=8000
```

Start the backend server:

```bash
npm start        # runs index.js on PORT (default 8000)
# or during development
npm run dev      # if you prefer nodemon (see package.json)
```

Optional: if you have a seeding script (e.g. `seedData.js`), you can run:

```bash
node seedData.js
```

---

## Frontend Setup (`frontend/`)

```bash
cd frontend
npm install
npm run dev
```

By default Vite runs on **http://localhost:5173**.

---

## URLs & Default Credentials

- **Frontend (Landing page)**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **Admin Panel**: http://localhost:5173/admin

Typical demo admin credentials (see `SETUP_GUIDE.md` / `IMPLEMENTATION_SUMMARY.md` for the latest values):

```text
Email:    admin@healthnexus.com  (or admin@gmail.com in some setups)
Password: admin123
```

Use the authentication modal on the landing page to register/login as **patient** or **doctor** via email + OTP.

---

## Running the Full System

1. **Start MongoDB** locally (or ensure your connection string is reachable).
2. **Start backend**:
   ```bash
   cd backend
   npm start
   ```
3. **Start frontend** in a second terminal:
   ```bash
   cd frontend
   npm run dev
   ```
4. Open **http://localhost:5173** in your browser.
5. Use the navigation or floating buttons to access Admin / Doctor / Patient portals and HealthBot.

---

## Quick Auth Testing

For a very fast way to verify the authentication flow (registration, OTP, login, reset password), follow the steps in:

- `QUICK_TEST_GUIDE.md`

Highlights:

- Use the **"Auth System Test"** component on the homepage.
- When email is not configured, OTP codes are logged to the **browser console**.

---

## Additional Documentation

Detailed, feature‑specific documentation is already included in this repo:

- **`IMPLEMENTATION_SUMMARY.md`** – High‑level summary of all features delivered.
- **`SETUP_GUIDE.md`** – Extended setup instructions, database structure, design system, deployment tips.
- **`AUTH_README.md`** – Full authentication system design, flows, API endpoints, and security notes.
- **`CHATBOT_README.md`** – Chatbot architecture, API endpoints, configuration, and troubleshooting.
- **`QUICK_TEST_GUIDE.md`** – Step‑by‑step guide to quickly test the auth system from the UI.
- **`PROFILE_PHOTO_FIX.md`** – Explanation of the permanent fix for doctor profile photo persistence.

These files are intentionally kept to complement this main `README.md`.

---

## Scripts Overview

### Backend (`backend/package.json`)

- `npm start` – Start Express server (production/dev without auto‑reload).
- `npm run dev` – Start server with nodemon (if configured).

### Frontend (`frontend/package.json`)

- `npm run dev` – Start Vite dev server.
- `npm run build` – Build production static assets.
- `npm run preview` – Preview the production build locally.
- `npm run lint` – Run ESLint on the frontend codebase.

---

## Author

- **Made by: Rajeev Kumar Pandit**
- Social profiles are linked in the website footer (Facebook, X/Twitter, Instagram, LinkedIn).

If you share or deploy this project, you can keep this credit line in the UI and documentation.
