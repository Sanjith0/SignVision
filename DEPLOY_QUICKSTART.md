# 🚀 SignVision - Quick Deployment (5 Minutes)

The **fastest** way to deploy SignVision to production.

## Prerequisites
- Google Gemini API Key ([Get it here](https://makersuite.google.com/app/apikey))
- GitHub account
- Your code pushed to GitHub

---

## Option 1: Render (Free - Recommended)

### 1. Push to GitHub (if not already)
```bash
cd /Users/sanjith/Downloads/SignVision1/SignVision
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/SignVision.git
git push -u origin main
```

### 2. Deploy on Render
1. Go to https://render.com → Sign up (free)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account
4. Select **SignVision** repository
5. Configure:
   - **Name**: `signvision`
   - **Environment**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn server:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Free
6. Click **"Advanced"** → Add Environment Variable:
   - **Key**: `GEMINI_API_KEY`
   - **Value**: `your_api_key_here`
7. Click **"Create Web Service"**

### 3. Wait & Launch
- Deployment takes 3-5 minutes
- You'll get a URL like: `https://signvision-xxxx.onrender.com`
- Open it on your iPhone Safari
- Tap Share → "Add to Home Screen"
- Done! 🎉

---

## Option 2: Railway (Even Easier)

### 1. One-Click Deploy
1. Go to https://railway.app → Sign up
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your SignVision repo
4. Click on the service → **"Variables"**
5. Add: `GEMINI_API_KEY` = `your_api_key_here`
6. Go to **"Settings"** → **"Generate Domain"**
7. Done! Your app is live 🚀

**URL**: `https://signvision-production-xxxx.up.railway.app`

---

## 🧪 Test Your Deployment

1. **Open URL on iPhone Safari**
2. **Grant camera permissions**
3. **Test features**:
   - ✅ Camera works
   - ✅ "Start Detection" works
   - ✅ Audio feedback plays
   - ✅ Recording works
4. **Install PWA**: Tap Share → "Add to Home Screen"

---

## 🐛 If Something Goes Wrong

### Camera doesn't work
- **Fix**: Make sure URL is `https://` (not `http://`)

### "API connection failed"
- **Fix**: Check browser console (Safari DevTools)
- Verify environment variable `GEMINI_API_KEY` is set

### 500 Error
- **Fix**: Check deployment logs
- Render: Dashboard → Logs
- Railway: Service → View Logs

### Gemini API error
- **Fix**: Verify API key at https://makersuite.google.com
- Check quota isn't exceeded

---

## 💡 Tips

1. **Free tier sleeps after 15 min** (Render)
   - First request may take 30s to wake up
   - Upgrade to $7/month for always-on

2. **Custom domain** (Optional)
   - Render: Settings → Custom Domain
   - Railway: Settings → Domains

3. **Auto-deploy**
   - Push to GitHub → auto-deploys
   - No manual steps needed

4. **Monitor API usage**
   - Check https://makersuite.google.com
   - Free tier: 60 requests/minute

---

## 📊 What's Next?

After deployment:
- Share the URL with users
- Monitor logs for errors
- Track API usage
- Add custom domain (optional)
- Upgrade to paid tier for better performance

---

**Congratulations! Your AI-powered road sign detector is live! 🎊**

Need more details? See `DEPLOYMENT.md` for comprehensive guide.

