# Free Deployment Guide - Render & Fly.io

## Option 1: Deploy to Render (Recommended for Free)

### Benefits
- **Free tier:** 750 hours/month (always on)
- No card required for free tier
- Automatic deploys from GitHub
- Similar to Railway but with better free support

### Steps

1. **Go to [render.com](https://render.com)**
   - Sign up or log in
   - Connect your GitHub account

2. **Create New Service**
   - Click "New +" → "Web Service"
   - Select your `swadhub` repository
   - Configuration:
     - **Name:** `swadhub-api`
     - **Runtime:** Python
     - **Build command:** `pip install -r requirements.txt`
     - **Start command:** `python app.py`
     - **Plan:** Free

3. **Set Environment Variables**
   - Click "Environment" tab
   - Add `PORT=8000`
   - Add `PYTHONUNBUFFERED=1`
   - (Optional) Add `ANTHROPIC_API_KEY` if you get one

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (2-3 minutes)
   - Your app will be live at `https://swadhub-api.onrender.com`

### Important Notes
- Free tier has a 15-minute inactivity spindown
- First request after spindown takes 30-50 seconds
- For 24/7 uptime, upgrade to $7/month

---

## Option 2: Deploy to Fly.io (Generous Free Tier)

### Benefits
- **Free tier:** 3 shared-cpu-1x 256MB VMs included
- Always-on, no spindown
- Global edge caching
- Great for production use

### Steps

1. **Install Fly CLI**
   ```bash
   # Download from https://fly.io/docs/hands-on/install-flyctl/
   # Or use Chocolatey
   choco install flyctl
   ```

2. **Authenticate**
   ```bash
   flyctl auth login
   # Opens browser to create Fly account & generate token
   ```

3. **Deploy**
   ```bash
   cd "c:\Users\DELL\OneDrive\Documents\Desktop\data analysis"
   flyctl launch
   # Answers:
   # - App name: swadhub-api
   # - Region: iad (or nearest to you)
   # - Dockerfile: yes
   # - Deploy now: yes
   ```

4. **Set Environment Variables**
   ```bash
   flyctl secrets set PYTHONUNBUFFERED=1 PORT=8000
   # Optionally: flyctl secrets set ANTHROPIC_API_KEY=your-key
   ```

5. **View Deployment**
   ```bash
   flyctl open
   # Or visit: https://swadhub-api.fly.dev
   ```

### Monitoring
```bash
flyctl logs                  # View logs
flyctl status               # Check status
flyctl scale count 1        # Ensure 1 instance
```

---

## Comparison

| Feature | Render | Fly.io |
|---------|--------|--------|
| **Free Tier** | 750 hrs/month | 3 VMs (always-on) |
| **Spindown** | 15 min inactive | None |
| **Setup** | Web UI only | CLI required |
| **Scaling** | Easy via UI | CLI or dashboard |
| **SSL** | Automatic | Automatic |
| **Best For** | Hobby projects | Production apps |

---

## Quick Comparison with Railway

- **Railway Free:** Limited resources, upgrade required
- **Render Free:** Good for hobby/testing, spindown after 15 min
- **Fly.io Free:** Best free option, always-on, true production-ready

---

## Local Testing Before Deploy

```bash
# Test locally first
python app.py
# Visit http://localhost:8000
```

Then push to GitHub and deploy to your chosen platform!

---

## Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Choose platform (Render or Fly.io)
- [ ] Connect GitHub account
- [ ] Set environment variables
- [ ] Deploy
- [ ] Test at live URL
- [ ] Monitor logs for errors

Need help with any step? Let me know!
