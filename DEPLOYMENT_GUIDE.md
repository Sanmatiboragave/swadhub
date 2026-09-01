# 🚀 Deployment Guide - Share Your Project

This guide will help you deploy your Support Ticket Triage Agent so your friend can access it online.

---

## Option 1: Deploy Frontend to Vercel (Recommended - Easiest)

### ✅ Steps:

1. **Sign up at Vercel**: https://vercel.com/signup
   - Use GitHub, GitLab, or Bitbucket account

2. **Import your repository**:
   - In Vercel dashboard, click "New Project"
   - Select your repository (Sanmatiboragave/swadhub)
   - Vercel will auto-detect the `vercel.json` config

3. **Configure Environment Variables** (if needed):
   - Add any API keys or backend URLs in project settings

4. **Deploy**:
   - Click "Deploy" - Vercel will build and host automatically
   - Your site will be at: `https://your-project.vercel.app`

---

## Option 2: Deploy Backend to Railway.app

### ✅ Steps:

1. **Sign up at Railway**: https://railway.app
   - Click "Start a New Project"

2. **Create a new service**:
   - Select "Deploy from GitHub repo" or upload manually
   - Choose this repository

3. **Configure**:
   - Railway will detect it's a Python Flask app
   - Set startup command: `python app.py`

4. **Add Python dependencies**:
   - Make sure `requirements.txt` exists (✓ you have it)
   - Railway will automatically install dependencies

5. **Environment Variables**:
   - Add `ANTHROPIC_API_KEY` in Railway dashboard
   - Any other env vars from `.env`

6. **Deploy**:
   - Railway deploys automatically
   - Get your public URL from the Railway dashboard
   - Your API will be at: `https://your-project.railway.app`

---

## Option 3: Full Stack on Render.com

### ✅ Steps for Backend:

1. **Sign up at Render**: https://render.com
2. **Create New → Web Service**
3. **Connect GitHub repo**
4. **Configuration**:
   - Runtime: Python 3
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `python app.py`
5. **Environment Variables**: Add your API keys
6. **Deploy** - Get your public URL

---

## Step-by-Step: Using Vercel (Easiest!)

### 1️⃣ Prepare your repository:
```bash
git add .
git commit -m "Prepare for deployment"
git push
```

### 2️⃣ Connect to Vercel:
- Go to https://vercel.com/import
- Authenticate with GitHub
- Select `Sanmatiboragave/swadhub`
- Vercel auto-configures based on `vercel.json`

### 3️⃣ Set Backend URL:
In `webapp/src/` components that call the API:
```javascript
// Before: http://localhost:8000
// After: https://your-backend.railway.app
const API_URL = process.env.REACT_APP_API_URL || 'https://your-backend.railway.app';
```

### 4️⃣ Share the links:
- **Frontend**: `https://your-project.vercel.app`
- **Backend API**: `https://your-backend.railway.app`

Send these to your friend! ✅

---

## Quick Reference: Deployment Checklist

- [ ] Frontend pushed to GitHub
- [ ] Backend pushed to GitHub  
- [ ] `.env` or environment variables configured
- [ ] `requirements.txt` up to date
- [ ] `vercel.json` configured (✓ already done)
- [ ] Vercel project connected
- [ ] Railway/Render backend connected
- [ ] Environment variables set in dashboard
- [ ] Test with friend accessing the link

---

## Troubleshooting

### "Module not found" error
- Ensure `requirements.txt` has all dependencies
- Run: `pip freeze > requirements.txt` locally to update

### "API not responding"
- Check backend service is running
- Verify API URL in frontend is correct
- Check environment variables are set

### "Build failed"
- Check build logs in platform dashboard
- Ensure `vite.config.js` is correct
- Try building locally: `cd webapp && npm run build`

---

## Need Help?

- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://docs.railway.app
- Render Docs: https://render.com/docs
