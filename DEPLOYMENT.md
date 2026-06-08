# Deployment

This guide documents the production deployment setup for ServiceTrak.

ServiceTrak is deployed as separate frontend and backend services with shared environment configuration:

| Layer | Service | Responsibility |
| --- | --- | --- |
| Frontend | React on Vercel | Browser app, protected routes, dashboard, forms, and API calls |
| Backend | Flask on Render | Authentication, authorization, REST API, database access, VIN/recall integrations |
| Database | Render/PostgreSQL-compatible `DATABASE_URL` | Persistent users, vehicles, service records, reminders, and attachment metadata |
| File Storage | Cloudinary | Uploaded service record receipts, invoices, images, and PDFs |

## Render Backend Setup

Create a Render web service for the Flask backend.

Recommended settings:

| Setting | Value |
| --- | --- |
| Root Directory | `backend` |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `gunicorn run:app` |
| Runtime | Python |

The backend entrypoint is `backend/run.py`, which exposes:

```python
app = create_app()
```

That is why the production start command is:

```bash
gunicorn run:app
```

## Render Environment Variables

Required environment variables:

```env
SECRET_KEY=replace-with-a-long-random-secret
JWT_SECRET_KEY=replace-with-a-different-long-random-secret
DATABASE_URL=postgresql://...
CORS_ORIGINS=https://service-trak.vercel.app
```

Notes:

- `SECRET_KEY` and `JWT_SECRET_KEY` must be different long random values.
- `DATABASE_URL` should point to the production database.
- `CORS_ORIGINS` must include the exact Vercel frontend origin.
- Do not use local SQLite as the production database.

## Database Migrations

ServiceTrak uses Flask-Migrate / Alembic for database migrations.

Run this after deploying backend code that includes schema changes:

```bash
flask db upgrade
```

If Render supports a predeploy command in your setup, use:

```bash
flask db upgrade
```

Otherwise, run the migration manually from Render's shell after deployment.

## Cloudinary Setup

Attachment uploads require Cloudinary credentials in Render.

Required environment variables:

```env
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

If these values are missing or invalid, the app can still run, but attachment uploads will fail.

## Vercel Frontend Setup

Deploy the `frontend` app to Vercel.

Recommended settings:

| Setting | Value |
| --- | --- |
| Root Directory | `frontend` |
| Install Command | `npm install` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

Required environment variable:

```env
VITE_API_BASE_URL=https://servicetrak-api.onrender.com
```

After changing Vercel environment variables, redeploy the frontend so the value is baked into the Vite build.

## Deployment Checklist

Before merging deployment-related changes:

| Check | Where | Expected |
| --- | --- | --- |
| Backend secrets | Render | `SECRET_KEY` and `JWT_SECRET_KEY` are set and different |
| Database URL | Render | `DATABASE_URL` points to the production database |
| CORS origin | Render | `CORS_ORIGINS` includes the exact Vercel URL |
| Cloudinary credentials | Render | Cloudinary vars are present if uploads are enabled |
| API base URL | Vercel | `VITE_API_BASE_URL` points to the Render backend |
| Migrations | Render shell or predeploy | `flask db upgrade` has run after schema changes |
| Production smoke test | Browser | Login reaches the Render API without CORS errors |

## Troubleshooting

| Problem | Likely Cause | Fix |
| --- | --- | --- |
| CORS error from Vercel | Render `CORS_ORIGINS` does not include the exact Vercel URL | Set `CORS_ORIGINS=https://service-trak.vercel.app` in Render and redeploy |
| Browser requests `127.0.0.1:5000` in production | `VITE_API_BASE_URL` is missing in Vercel | Add `VITE_API_BASE_URL=https://servicetrak-api.onrender.com` and redeploy frontend |
| Backend fails on startup | Missing `SECRET_KEY`, `JWT_SECRET_KEY`, or `DATABASE_URL` | Add required Render environment variables |
| Tables or columns are missing | Migrations have not been run | Run `flask db upgrade` against the production database |
| Attachment upload fails | Missing or invalid Cloudinary credentials | Verify `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` |
| Login works locally but not in production | CORS or frontend API URL mismatch | Check both `CORS_ORIGINS` in Render and `VITE_API_BASE_URL` in Vercel |
