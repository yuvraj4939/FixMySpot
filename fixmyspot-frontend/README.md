# FixMySpot Frontend

React + Vite frontend for FixMySpot.

## Local development

Create `.env` from `.env.example`, then:

```powershell
npm install
npm run dev
```

The default local API is `http://localhost:5000/api`.

## Production

Set `VITE_API_URL` to the deployed backend API URL ending in `/api`.
For GitHub Pages, the repository workflow reads this value from the GitHub Actions repository variable named `VITE_API_URL`.

The Vite `base` is configured for:

```text
/FixMySpot/
```

The React router uses the same base path so internal navigation works under the GitHub Pages project URL.
