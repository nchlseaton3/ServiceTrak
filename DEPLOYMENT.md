# Deployment

## Render Backend

Create a Render web service for the Flask backend.

Recommended settings:

- Root directory: `backend`
- Build command: `pip install -r requirements.txt`
- Start command: `gunicorn run:app`

Required environment variables:

```env
SECRET_KEY=replace-with-a-long-random-secret
JWT_SECRET_KEY=replace-with-a-different-long-random-secret
DATABASE_URL=postgresql://...
CORS_ORIGINS=https://service-trak.vercel.app
```

Required for attachment uploads:

```env
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

Migration command:

```bash
flask db upgrade
```

Run this after deploying backend code that includes database migrations.

## Vercel Frontend

Deploy the `frontend` app to Vercel.

Required environment variable:

```env
VITE_API_BASE_URL=https://servicetrak-api.onrender.com
```

After changing Vercel environment variables, redeploy the frontend.

## Troubleshooting

- CORS errors from Vercel usually mean Render `CORS_ORIGINS` does not include the exact Vercel origin.
- Requests going to `127.0.0.1:5000` in production usually mean `VITE_API_BASE_URL` is missing in Vercel.
- Backend startup failures in production usually mean `SECRET_KEY`, `JWT_SECRET_KEY`, or `DATABASE_URL` is missing.
- Missing tables or columns usually mean `flask db upgrade` has not been run against the production database.
- Attachment upload failures usually mean one or more Cloudinary environment variables are missing or invalid.
