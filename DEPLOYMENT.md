# SignVision Deployment Guide

This guide covers multiple deployment options for SignVision, from quick free deployments to production-ready setups.

## 📋 Prerequisites

Before deploying, you'll need:

1. **Google Gemini API Key**: Get one at https://makersuite.google.com/app/apikey
2. **Git repository**: Your code should be in a Git repository (GitHub, GitLab, etc.)
3. **Account on deployment platform**: Choose one from the options below

---

## 🚀 Quick Deploy Options

### Option 1: Render (Recommended - Free Tier Available)

**Pros**: Free tier, easy setup, HTTPS included, good for production  
**Cons**: May sleep after inactivity on free tier

#### Steps:

1. **Sign up at [Render](https://render.com)**

2. **Create a New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub/GitLab repository
   - Select the SignVision repository

3. **Configure the Service**
   ```
   Name: signvision
   Environment: Python
   Region: Choose closest to your users
   Branch: main
   Build Command: pip install -r requirements.txt
   Start Command: uvicorn server:app --host 0.0.0.0 --port $PORT
   ```

4. **Add Environment Variable**
   - Go to "Environment" tab
   - Add: `GEMINI_API_KEY` = `your_api_key_here`

5. **Deploy**
   - Click "Create Web Service"
   - Wait 2-5 minutes for deployment
   - Your app will be live at `https://signvision-xxxx.onrender.com`

6. **Test**
   - Open the URL in your iPhone Safari
   - Add to Home Screen for PWA experience

---

### Option 2: Railway (Easy & Fast)

**Pros**: Very easy deployment, generous free tier, fast builds  
**Cons**: Credit card required for free tier (no charges)

#### Steps:

1. **Sign up at [Railway](https://railway.app)**

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your SignVision repository

3. **Railway auto-detects Python**
   - It will automatically use the `railway.json` config
   - No additional configuration needed

4. **Add Environment Variables**
   - Click on your service → "Variables"
   - Add: `GEMINI_API_KEY` = `your_api_key_here`

5. **Generate Domain**
   - Go to "Settings" → "Networking"
   - Click "Generate Domain"
   - Your app will be live at `https://signvision-production-xxxx.up.railway.app`

6. **Deploy**
   - Railway automatically deploys on git push
   - Initial deployment takes 2-3 minutes

---

### Option 3: Heroku (Classic Platform)

**Pros**: Mature platform, lots of documentation  
**Cons**: No free tier anymore (starting at $5/month)

#### Steps:

1. **Install Heroku CLI**
   ```bash
   brew install heroku/brew/heroku  # macOS
   ```

2. **Login and Create App**
   ```bash
   cd /path/to/SignVision
   heroku login
   heroku create signvision-app
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set GEMINI_API_KEY=your_api_key_here
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

5. **Open App**
   ```bash
   heroku open
   ```

---

### Option 4: DigitalOcean App Platform

**Pros**: Good performance, predictable pricing ($5/month)  
**Cons**: Not free, slightly more complex

#### Steps:

1. **Sign up at [DigitalOcean](https://www.digitalocean.com)**

2. **Create New App**
   - Go to Apps → "Create App"
   - Connect GitHub repository
   - Select SignVision repo

3. **Configure**
   ```
   Type: Web Service
   Run Command: uvicorn server:app --host 0.0.0.0 --port $PORT
   HTTP Port: 8080
   ```

4. **Add Environment Variables**
   - Add `GEMINI_API_KEY` in the Environment Variables section

5. **Choose Plan**
   - Basic: $5/month (recommended)
   - Pro: $12/month (better performance)

6. **Launch**
   - Click "Create Resources"
   - Wait for deployment
   - Your app will be at `https://signvision-xxxxx.ondigitalocean.app`

---

### Option 5: Vercel (Frontend) + Render/Railway (Backend)

**Pros**: Best performance for frontend, free tier  
**Cons**: Requires separate backend deployment

#### Frontend on Vercel:

1. **Sign up at [Vercel](https://vercel.com)**

2. **Deploy Frontend**
   - Import your GitHub repository
   - Framework Preset: Other
   - No build command needed (static files)
   - Deploy

3. **Update API Endpoint**
   - The frontend will automatically use relative URLs
   - But for separate backend, update `script.js`:
   ```javascript
   apiEndpoint: 'https://your-backend-url.com/analyze'
   ```

#### Backend:
- Use Render or Railway (see Options 1 & 2 above)
- Only deploy the Python backend

---

## 🔧 Configuration for Production

### 1. CORS Configuration

For production, update `server.py` to restrict CORS:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-production-domain.com",
        "https://signvision.onrender.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 2. Environment Variables

Always set these environment variables on your deployment platform:

- `GEMINI_API_KEY`: Your Google Gemini API key (required)
- `ENVIRONMENT`: Set to `production` (optional)
- `PORT`: Usually auto-set by the platform

### 3. HTTPS

All deployment platforms above provide HTTPS automatically. This is **required** for:
- Camera access in browsers
- PWA installation
- Secure API communication

---

## 📱 Testing Your Deployment

1. **Open in iPhone Safari**
   ```
   https://your-deployed-app.com
   ```

2. **Install as PWA**
   - Tap Share button
   - Scroll down → "Add to Home Screen"
   - Launch from home screen

3. **Test Features**
   - ✅ Camera access
   - ✅ Start detection
   - ✅ Audio feedback
   - ✅ Recording
   - ✅ Settings

---

## 🐛 Troubleshooting

### Camera Not Working
- **Cause**: Not using HTTPS
- **Fix**: Ensure deployment URL is `https://`

### API Connection Failed
- **Cause**: Wrong API endpoint
- **Fix**: Check browser console, verify endpoint URL

### 500 Error on /analyze
- **Cause**: Missing GEMINI_API_KEY
- **Fix**: Add environment variable on deployment platform

### Gemini API Errors
- **Cause**: Invalid API key or quota exceeded
- **Fix**: Check API key, monitor usage at https://makersuite.google.com

### Slow Response Times
- **Cause**: Free tier cold starts
- **Fix**: Upgrade to paid tier or keep app warm with uptime monitor

---

## 💰 Cost Comparison

| Platform | Free Tier | Paid Tier | Best For |
|----------|-----------|-----------|----------|
| **Render** | 750 hrs/month (sleeps) | $7/month | Best free option |
| **Railway** | $5 credit/month | Pay-as-you-go | Easy deployment |
| **Heroku** | None | $5-$7/month | Mature platform |
| **DigitalOcean** | None | $5/month | Predictable pricing |
| **Vercel (frontend only)** | Unlimited | Free for personal | Best frontend performance |

### Gemini API Costs
- **Free tier**: 60 requests/minute
- **Pay-as-you-go**: ~$0.00025 per request
- **Estimate**: ~$1-5/month for moderate use

---

## 🔄 Continuous Deployment

All platforms above support automatic deployments:

1. **Enable Auto-Deploy**
   - Link your GitHub repository
   - Enable "Auto-Deploy" on main branch

2. **Push Updates**
   ```bash
   git add .
   git commit -m "Update feature"
   git push origin main
   ```

3. **Automatic Build**
   - Platform detects push
   - Runs build & deploy automatically
   - Live in 2-5 minutes

---

## 📊 Monitoring & Logs

### Render
- Dashboard → Your Service → "Logs"
- Real-time log streaming

### Railway
- Project → Service → "Deployments" → "View Logs"

### Heroku
```bash
heroku logs --tail
```

### DigitalOcean
- App → Runtime Logs

---

## 🔒 Security Best Practices

1. **Never commit .env file**
   ```bash
   # Already in .gitignore
   .env
   ```

2. **Use environment variables**
   - Set GEMINI_API_KEY on platform dashboard
   - Never hardcode in source code

3. **Restrict CORS**
   - Update `allow_origins` to your domain only

4. **Monitor API Usage**
   - Check Gemini API dashboard regularly
   - Set up billing alerts

5. **Rate Limiting** (Optional)
   - Add rate limiting to `/analyze` endpoint
   - Prevents API abuse

---

## 🎯 Recommended Setup for Different Scenarios

### Personal Use / Testing
- **Platform**: Render (Free)
- **Cost**: $0/month
- **Pros**: Free, easy, sufficient for testing

### Small Team / Production
- **Platform**: Railway or Render (Paid)
- **Cost**: $5-7/month
- **Pros**: No cold starts, better performance

### High Traffic / Enterprise
- **Platform**: DigitalOcean App Platform or AWS
- **Cost**: $12-50/month
- **Pros**: Scalable, reliable, custom domain

---

## 📞 Need Help?

1. Check logs on your deployment platform
2. Review browser console for frontend errors
3. Test API endpoint directly: `https://your-app.com/`
4. Verify environment variables are set correctly
5. Check Gemini API quota and billing

---

## ✅ Deployment Checklist

Before going live:

- [ ] Gemini API key added as environment variable
- [ ] App builds successfully
- [ ] Health check endpoint (`/`) returns 200
- [ ] `/analyze` endpoint works
- [ ] Frontend loads without errors
- [ ] Camera access works on HTTPS
- [ ] PWA installs on iPhone
- [ ] Audio feedback works
- [ ] Recording feature works
- [ ] CORS configured correctly
- [ ] Logs are being captured
- [ ] Cost monitoring set up

---

**Congratulations! Your SignVision app is now deployed! 🎉**

Visit your deployment URL on your iPhone, add it to your home screen, and start detecting road signs with AI assistance.

