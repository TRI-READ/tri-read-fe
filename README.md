# TRI:READ Frontend

Next.js web app for the TRI:READ weekday reading quiz.

## Stack

- Next.js App Router
- React
- JavaScript
- CSS Modules

## Local run

Start the backend on port 8080, then run:

```bash
npm install
npm run dev
```

Open http://localhost:3000. Next.js proxies `/api/*` to the backend so the
browser can use the Spring Security session and CSRF cookies as same-origin
requests.

Override the backend address when needed:

```powershell
$env:API_BASE_URL="http://localhost:8080"
npm run dev
```
