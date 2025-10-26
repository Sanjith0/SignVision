# 🚀 Deploy SignVision on Vercel

Complete guide for deploying SignVision on Vercel with serverless functions.

---

## ✨ Why Vercel?

- ✅ **Free Tier**: Generous free plan for personal projects
- ✅ **Fast Deployments**: Builds in 1-2 minutes
- ✅ **Auto HTTPS**: Free SSL certificates included
- ✅ **Global CDN**: Fast loading worldwide
- ✅ **Auto Scaling**: Handles traffic spikes automatically
- ✅ **Git Integration**: Auto-deploy on push
- ✅ **Serverless Functions**: Python backend included

---

## 📋 Prerequisites

Before deploying, ensure you have:

1. ✅ **Vercel Account**: Sign up at https://vercel.com (free)
2. ✅ **GitHub Account**: Your code must be on GitHub
3. ✅ **Google Gemini API Key**: Get at https://makersuite.google.com/app/apikey
4. ✅ **Git Repository**: Code pushed to GitHub

---

## 🚀 Method 1: Deploy via Web Interface (Recommended - 5 Minutes)

### Step 1: Push Code to GitHub

If not already done:

```bash
cd /Users/sanjith/Downloads/SignVision1/SignVision

# Initialize git if needed
git init

# Add all files
git add .

# Commit
git commit -m "Ready for Vercel deployment"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/SignVision.git
git branch -M main
git push -u origin main
```

### Step 2: Import to Vercel

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com/dashboard
   - Sign in with GitHub

2. **Create New Project**
   - Click **"Add New..."** → **"Project"**
   - Click **"Import"** next to your SignVision repository
   - Or click **"Import Git Repository"** and paste the URL

3. **Configure Project**
   - **Project Name**: `signvision` (or your preferred name)
   - **Framework Preset**: Other (no framework)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: Leave empty
   - **Output Directory**: Leave empty
   - **Install Command**: Leave empty

### Step 3: Add Environment Variables

Before deploying, add your API key:

1. **In the import screen**, scroll to **"Environment Variables"**
2. Click **"Add"**
3. Add the following:
   ```
   Name: GEMINI_API_KEY
   Value: your_actual_api_key_here
   Environment: Production, Preview, Development (check all)
   ```

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for deployment
3. Vercel will build and deploy your app
4. You'll see a success message with your URL

### Step 5: Get Your URL

Your app will be live at:
```
https://signvision-username.vercel.app
```

Or a custom domain if configured.

---

## 🖥️ Method 2: Deploy via CLI (Advanced - 3 Minutes)

### Step 1: Install Vercel CLI

```bash
# Install globally
npm install -g vercel

# Or using Homebrew (macOS)
brew install vercel-cli
```

### Step 2: Login

```bash
vercel login
```

Follow the prompts to authenticate.

### Step 3: Deploy

```bash
cd /Users/sanjith/Downloads/SignVision1/SignVision

# Deploy to production
vercel --prod
```

### Step 4: Add Environment Variable

```bash
vercel env add GEMINI_API_KEY production
```

Paste your API key when prompted.

### Step 5: Redeploy with Environment Variable

```bash
vercel --prod
```

Done! Your app is live.

---

## 🔍 Verify Deployment

### 1. Check Health Endpoint

```bash
curl https://your-app.vercel.app/
```

Expected response:
```json
{
  "message": "SignVision API is running on Vercel",
  "status": "ok",
  "gemini_configured": true
}
```

### 2. Open in Browser

Visit: `https://your-app.vercel.app`

You should see the SignVision interface.

### 3. Test on iPhone

1. Open Safari on iPhone
2. Navigate to your Vercel URL
3. Grant camera permissions
4. Click "Start Detection"
5. Test features

### 4. Install as PWA

1. In Safari, tap **Share** button
2. Scroll down → **"Add to Home Screen"**
3. Tap **"Add"**
4. Launch from home screen

---

## ⚙️ Configuration Details

### What Vercel Does Automatically

1. **Detects Python**: Sees `requirements.txt` and installs dependencies
2. **Creates Serverless Function**: Uses `/api/index.py` as the backend
3. **Serves Static Files**: HTML, CSS, JS served from root
4. **Routes Traffic**: Uses `vercel.json` routing rules
5. **Enables HTTPS**: Automatic SSL certificate
6. **Sets Up CDN**: Global edge network for fast loading

### File Structure for Vercel

```
SignVision/
├── api/
│   └── index.py          # Backend serverless function
├── index.html            # Frontend (served at /)
├── script.js             # Frontend JS
├── style.css             # Frontend CSS
├── manifest.json         # PWA manifest
├── sw.js                 # Service worker
├── vercel.json           # Vercel configuration
├── requirements.txt      # Python dependencies
└── runtime.txt           # Python version
```

### How Routing Works

From `vercel.json`:

```json
{
  "routes": [
    {
      "src": "/analyze",
      "dest": "api/index.py"      // API requests → serverless function
    },
    {
      "src": "/(.*\\.(js|css))",
      "dest": "/$1"                // Static files → CDN
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"        // Everything else → index.html
    }
  ]
}
```

---

## 🔧 Managing Your Deployment

### View Logs

**Via Dashboard:**
1. Go to https://vercel.com/dashboard
2. Click your project
3. Click a deployment
4. View "Functions" tab for logs

**Via CLI:**
```bash
vercel logs
```

### Update Environment Variables

**Via Dashboard:**
1. Project → Settings → Environment Variables
2. Edit `GEMINI_API_KEY`
3. Redeploy (automatic)

**Via CLI:**
```bash
vercel env rm GEMINI_API_KEY production
vercel env add GEMINI_API_KEY production
vercel --prod
```

### Redeploy

**Automatic:**
- Push to GitHub → Auto-deploys

**Manual:**
```bash
vercel --prod
```

### View Deployments

```bash
vercel ls
```

### Rollback

1. Dashboard → Project → Deployments
2. Find previous working deployment
3. Click "⋮" → "Promote to Production"

---

## 🎨 Custom Domain (Optional)

### Add Your Domain

1. **Buy Domain** (e.g., from Namecheap, GoDaddy)

2. **Add to Vercel**
   - Dashboard → Project → Settings → Domains
   - Click "Add"
   - Enter your domain: `signvision.com`

3. **Configure DNS**
   - Vercel shows you DNS records to add
   - Add these to your domain registrar
   - Wait for propagation (5-60 minutes)

4. **Done!**
   - Your app is at `https://signvision.com`
   - Automatic HTTPS

---

## 📊 Vercel Free Tier Limits

| Resource | Free Tier | Notes |
|----------|-----------|-------|
| **Deployments** | Unlimited | As many as you want |
| **Bandwidth** | 100 GB/month | Usually sufficient |
| **Function Executions** | 100 GB-Hrs | ~500K requests |
| **Function Duration** | 10 seconds max | Per request |
| **Build Time** | 6000 minutes/month | ~200 builds |
| **Team Members** | 1 | Just you |

### When to Upgrade?

Upgrade to **Pro ($20/month)** if:
- More than 100 GB bandwidth
- Need longer function execution (60s)
- Want team collaboration
- Need advanced analytics

---

## 🐛 Troubleshooting

### Issue: "Build failed"

**Cause**: Missing dependencies or incorrect config

**Solution**:
1. Check `requirements.txt` has all dependencies
2. Verify `vercel.json` syntax is correct
3. Check build logs in Vercel dashboard

### Issue: "Function timed out"

**Cause**: Gemini API took longer than 10 seconds

**Solution**:
1. Optimize image size (reduce quality in `script.js`)
2. Use faster Gemini model (gemini-flash)
3. Upgrade to Pro plan (60s timeout)

### Issue: "GEMINI_API_KEY not found"

**Cause**: Environment variable not set

**Solution**:
```bash
vercel env add GEMINI_API_KEY production
```

Then redeploy:
```bash
vercel --prod
```

### Issue: "Camera not working"

**Cause**: Not using HTTPS or permissions denied

**Solution**:
- Vercel always uses HTTPS ✅
- Check browser permissions
- Use Safari on iPhone (Chrome may have issues)

### Issue: "API returns 500 error"

**Cause**: Gemini API error or invalid key

**Solution**:
1. Check logs: Dashboard → Functions → View Logs
2. Verify API key at https://makersuite.google.com
3. Check API quota isn't exceeded

### Issue: "Static files not loading"

**Cause**: Incorrect file paths or routing

**Solution**:
1. Verify `vercel.json` routes are correct
2. Check file names are exact (case-sensitive)
3. Clear cache and refresh

---

## 🔒 Security Best Practices

### 1. Environment Variables

✅ **DO:**
- Store API keys in Vercel environment variables
- Use different keys for preview/production

❌ **DON'T:**
- Commit `.env` file to Git
- Hardcode API keys in code

### 2. CORS

Update `api/index.py` to restrict CORS in production:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-app.vercel.app"],  # Your Vercel domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 3. Rate Limiting

Consider adding rate limiting to prevent abuse:

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/analyze")
@limiter.limit("10/minute")  # 10 requests per minute
async def analyze_image(...):
    ...
```

### 4. API Key Security

- Never log API keys
- Rotate keys periodically
- Monitor usage on Google Cloud Console

---

## 📈 Monitoring & Analytics

### Vercel Analytics (Built-in)

1. Dashboard → Project → Analytics
2. View:
   - Page views
   - Unique visitors
   - Performance metrics
   - Error rates

### Gemini API Usage

1. Visit https://makersuite.google.com
2. Check:
   - Request count
   - Quota usage
   - Costs (if on paid plan)

### Set Up Alerts

**Vercel:**
- Settings → Notifications
- Enable deployment notifications
- Get alerts for failures

**Google Cloud:**
- Set billing alerts
- Monitor API quota

---

## 🚀 Performance Optimization

### 1. Image Optimization

In `script.js`, adjust compression:

```javascript
canvas.toBlob(
    (blob) => { ... },
    'image/webp',
    0.5  // Lower = smaller file, faster upload
);
```

### 2. Caching

Vercel automatically caches static files. For API responses:

```python
@app.get("/models")
async def list_models(response: Response):
    response.headers["Cache-Control"] = "public, max-age=3600"  # 1 hour
    ...
```

### 3. Edge Functions (Advanced)

For global low-latency, consider Vercel Edge Functions (upgrade required).

---

## 🔄 Continuous Deployment

### Auto-Deploy Setup

1. **Connect GitHub** (already done during import)
2. **Enable Auto-Deploy**
   - Settings → Git → Production Branch: `main`
   - ✅ Automatically deploy new commits

3. **Workflow**
   ```bash
   # Make changes locally
   git add .
   git commit -m "Update feature"
   git push origin main
   
   # Vercel automatically:
   # 1. Detects push
   # 2. Builds project
   # 3. Runs tests (if configured)
   # 4. Deploys to production
   # 5. Live in 2-3 minutes
   ```

### Preview Deployments

Every pull request gets a preview URL:
- Test changes before merging
- Share with team for review
- Automatic cleanup after merge

---

## 💰 Cost Estimate

### Free Tier (Most Users)
- **Vercel**: $0/month
- **Gemini API**: $0-5/month (free tier covers ~60 requests/min)
- **Domain** (optional): $10-15/year
- **Total**: $0-5/month

### Pro Plan (High Traffic)
- **Vercel Pro**: $20/month
- **Gemini API**: $5-20/month (pay-as-you-go)
- **Domain** (optional): $10-15/year
- **Total**: $25-40/month

---

## ✅ Deployment Checklist

Before going live:

- [x] Code pushed to GitHub
- [x] Vercel account created
- [x] Project imported to Vercel
- [x] `GEMINI_API_KEY` environment variable set
- [x] Deployment successful (green checkmark)
- [x] Health check endpoint returns 200
- [x] Frontend loads without errors
- [x] Camera access works on iPhone
- [x] API `/analyze` endpoint works
- [x] Audio feedback works
- [x] PWA installs successfully
- [x] Recording feature works
- [x] Custom domain configured (optional)

---

## 🎉 Success!

Your SignVision app is now live on Vercel!

**Next Steps:**
1. Share your URL with users
2. Monitor logs and analytics
3. Gather feedback
4. Iterate and improve

**Your Deployment URLs:**
- **Production**: https://signvision.vercel.app
- **Git Branch**: https://signvision-git-branch.vercel.app
- **Custom Domain**: https://your-domain.com (if configured)

---

## 📞 Need Help?

### Vercel Support
- **Docs**: https://vercel.com/docs
- **Community**: https://github.com/vercel/vercel/discussions
- **Support**: support@vercel.com

### SignVision Issues
- Check logs in Vercel dashboard
- Review browser console
- Test API endpoint directly
- Verify environment variables

### Quick Commands Reference

```bash
# Deploy to production
vercel --prod

# View logs
vercel logs

# List deployments
vercel ls

# Add environment variable
vercel env add GEMINI_API_KEY

# Pull environment variables locally
vercel env pull

# Remove a deployment
vercel rm deployment-url
```

---

**Congratulations! 🎊 Your AI-powered road sign detector is live on Vercel!**

*Powered by Vercel Serverless Functions & Google Gemini AI*

