# Vercel & Railway Deployment Guide

## Vercel Deployment

### Prerequisites
- Vercel account
- Git repository (GitHub, GitLab, or Bitbucket)

### Steps

1. **Push to Git**
   ```bash
   git add .
   git commit -m "Add Vercel and Railway deployment configs"
   git push
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your Git repository
   - Select root directory: `.`
   - Leave build and output settings as default (vercel.json will configure)

3. **Set Environment Variables**
   - In Vercel dashboard, go to Settings → Environment Variables
   - Add `ANTHROPIC_API_KEY` with your API key
   - Ensure it's available for Production and Preview environments

4. **Deploy**
   - Click Deploy
   - Wait for build to complete
   - Your app will be live at `https://your-project.vercel.app`

### Features
- React frontend deployed as static files
- Flask API routes served through serverless functions
- Automatic deployments on git push

---

## Railway Deployment

### Prerequisites
- Railway account
- Git repository pushed to GitHub

### Steps

1. **Connect to Railway**
   - Go to [railway.app](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Authorize Railway with GitHub
   - Select your repository

2. **Configure Railway**
   - Railway auto-detects Dockerfile
   - It will build and deploy automatically

3. **Set Environment Variables**
   - In Railway dashboard, go to Variables
   - Add `ANTHROPIC_API_KEY=your-key`
   - Add `PORT=8000`
   - Save changes

4. **View Deployment**
   - Railway will generate a domain URL
   - Your app will be live at that URL
   - Logs available in the Railway dashboard

### Features
- Full Docker container deployment
- Persistent file system for results
- Easy scaling
- Integrated database support (if needed)

---

## Local Development

### With Docker
```bash
docker build -t ticket-triage .
docker run -p 8000:8000 \
  -e ANTHROPIC_API_KEY=your-key \
  ticket-triage
```

### Without Docker
```bash
# Backend
pip install -r requirements.txt
python app.py

# Frontend (in another terminal)
cd webapp
npm install
npm run dev
```

---

## File Structure

```
root/
├── app.py                    # Flask backend (main)
├── api/
│   └── index.py             # Vercel serverless functions
├── Dockerfile               # Docker container config
├── vercel.json             # Vercel deployment config
├── railway.json            # Railway deployment config
├── railway.toml            # Railway deployment config (alternative)
├── requirements.txt        # Python dependencies
├── webapp/                 # React frontend
│   ├── src/
│   ├── package.json
│   └── vite.config.js
└── food-delivery-analytics/
    └── ...
```

---

## Monitoring & Logs

### Vercel
- Deployments tab shows build logs
- Function logs in Analytics
- Realtime monitoring available

### Railway
- All logs in dashboard
- Network tab for traffic analysis
- Metrics for resource usage

---

## Troubleshooting

**Vercel Issues:**
- Check build logs in Deployments tab
- Ensure all dependencies in requirements.txt
- Check environment variables are set

**Railway Issues:**
- Check build logs in Railway dashboard
- Ensure Dockerfile builds locally: `docker build .`
- Check PORT environment variable is set to 8000

**Both Platforms:**
- Test locally first with Docker
- Check logs for missing dependencies
- Verify environment variables are set
