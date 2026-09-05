# FixMySpot Backend

## Run
```powershell
npm install
npm run dev
```

## .env
Set the MongoDB and SMTP settings in `.env`.

### Gmail OTP setup
For Gmail, use a Google App Password (not your normal Gmail password):
- SMTP_HOST=smtp.gmail.com
- SMTP_PORT=587
- SMTP_USER=your Gmail address
- SMTP_PASS=your 16-character App Password
- MAIL_FROM=FixMySpot <your Gmail address>

## Forgot Password OTP flow
1. `POST /api/auth/forgot-password` with `{ "email": "..." }`
2. OTP is emailed to the user.
3. `POST /api/auth/verify-reset-otp` with `{ "email": "...", "otp": "123456" }`
4. `POST /api/auth/reset-password` with `{ "email": "...", "otp": "123456", "newPassword": "..." }`

OTP:
- 6 digits
- expires after `OTP_EXPIRES_MINUTES` (default 10)
- 60-second resend cooldown
- maximum 5 incorrect attempts
- only an OTP hash is stored in MongoDB, not the plaintext OTP

## Admin
Create an admin with `POST /api/auth/seed-admin`.
