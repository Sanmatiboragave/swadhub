# 🚀 Quick Deployment - 5 Minutes!

## Step 1: Deploy Backend to Railway ⚙️

### 1.1 Sign up and connect:
```bash
# 1. Go to https://railway.app
# 2. Click "New Project" → "Deploy from GitHub"
# 3. Connect your GitHub account
# 4. Select "Sanmatiboragave/swadhub" repository
```

### 1.2 Configure:
- Railway auto-detects Python project
- Leave default settings (it will use `requirements.txt`)
- Start command: `python app.py` (or leave blank - Railway auto-detects)

### 1.3 Add Environment Variables:
In Railway dashboard → Project → Variables:
```
ANTHROPIC_API_KEY = sk-ant-xxxxxxxxxxxx  (Get from https://console.anthropic.com)
FLASK_ENV = production
```

### 1.4 Deploy:
- Click "Deploy"
- Wait for deployment to complete
- Copy your Railway URL: `https://your-project.railway.app`

---

## Step 2: Update Frontend Config 🎨

### 2.1 Update `.env.production`:
```bash
# Replace with your Railway backend URL
VITE_API_URL=https://your-project.railway.app
```

### 2.2 Commit changes:
```bash
cd C:\Users\DELL\OneDrive\Documents\Desktop\data analysis.worktrees\project-execution-setup
git add .env.production webapp/vite.config.js railway.json
git commit -m "Configure deployment settings"
git push origin main
```

---

## Step 3: Deploy Frontend to Vercel 🌐

### 3.1 Import to Vercel:
```bash
# 1. Go to https://vercel.com
# 2. Click "Add New..." → "Project"
# 3. Import "Sanmatiboragave/swadhub"
```

### 3.2 Configure:
- Vercel auto-detects `vercel.json`
- Framework: React
- Root Directory: `./`
- Build Command: Already configured in `vercel.json`
- Environment Variables:
  ```
  VITE_API_URL = https://your-project.railway.app
  ```

### 3.3 Deploy:
- Click "Deploy"
- Get your Vercel URL: `https://your-project.vercel.app`

---

## Step 4: Share with Your Friend! 🎉

Send these links:
- **Frontend**: `https://your-project.vercel.app`
- **Backend API**: `https://your-project.railway.app`

---

## Troubleshooting

### ❌ "CORS Error" or "API not responding"
- Make sure backend Railway app is running
- Check backend logs in Railway dashboard
- Update `VITE_API_URL` in Vercel environment variables

### ❌ "Module not found"
- Check `requirements.txt` has all dependencies
- View Railway logs to see exact error

### ❌ "Build failed on Vercel"
- Click "Redeploy" to retry
- Check Vercel build logs
- Ensure `vercel.json` is correct

---

## Quick Links

- Railway Dashboard: https://railway.app/dashboard
- Vercel Dashboard: https://vercel.com/dashboard
- Anthropic Console: https://console.anthropic.com

---

## Done! ✅

Your project is now live! Share the Vercel frontend URL with your friend and they can access your Support Ticket Triage Agent!
