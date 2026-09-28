# FixMySpot Backend

Node.js + Express + MongoDB API for FixMySpot.

## Run locally

Create `.env` from `.env.example`, then:

```powershell
npm install
npm run dev
```

Health check:

```powershell
Invoke-RestMethod http://localhost:5000/api/health
```

## Required environment variables

```text
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/fixmyspot
JWT_SECRET=replace_with_a_long_random_secret
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

## Admin setup

Use the `POST /api/auth/seed-admin` endpoint only during setup. In production, set `ADMIN_SETUP_KEY` and send it as the `x-admin-setup-key` header.

## Password reset OTP

The flow is:

1. `POST /api/auth/forgot-password`
2. `POST /api/auth/verify-reset-otp`
3. `POST /api/auth/reset-password`

The OTP is six digits, expires after `OTP_EXPIRES_MINUTES` (default 10), and is stored only as a SHA-256 hash. SMTP must be configured for the email to be delivered.

For Gmail SMTP, use a Google App Password rather than the normal account password.
