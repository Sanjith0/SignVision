# SignVision - Real-Time Road Sign Detection

A mobile-friendly Progressive Web App (PWA) that uses iPhone's rear camera with Google Gemini AI for real-time detection of road signs, crosswalks, and hazards. Features augmented-reality overlays and audio alerts for visually impaired users.

## 🌟 Features

- **Real-Time Vision Processing**: iPhone rear camera → Python backend → Google Gemini AI
- **AR Overlays**: Bounding boxes and labels overlaid on live video feed
- **Audio Feedback**: Web Speech API for real-time voice alerts
- **Dashcam Recording**: 30-second recording stored in IndexedDB
- **Fall Detection**: Device motion sensors detect sudden falls
- **Offline Capability**: PWA with service worker caching
- **Battery Optimized**: Frame rate throttling and efficient processing

## 📋 Requirements

- Python 3.8+
- Google Gemini API Key ([Get one here](https://makersuite.google.com/app/apikey))
- iPhone with Safari (iOS 14+)
- HTTPS connection (required for camera access and PWA)

## 🚀 Quick Start

### 1. Backend Setup

```bash
# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp env.example .env

# Edit .env and add your Gemini API key
nano .env
```

Add your API key:
```
GEMINI_API_KEY=your_actual_api_key_here
```

### 2. Start Backend Server

```bash
# Start the FastAPI server
python server.py

# Or using uvicorn directly
uvicorn server:app --host 0.0.0.0 --port 8000
```

The server will start at `http://localhost:8000`

### 3. Frontend Setup

#### Option A: HTTPS with ngrok (Recommended for testing)

```bash
# Install ngrok (if not installed)
brew install ngrok  # macOS
# or download from https://ngrok.com

# Start ngrok tunnel
ngrok http 8000

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
```

#### Option B: Local Network

1. Find your computer's IP address:
```bash
# macOS/Linux
ifconfig | grep "inet "

# Windows
ipconfig
```

2. Update the API endpoint in `script.js` line 19:
```javascript
config: {
    apiEndpoint: 'http://YOUR_IP:8000/analyze',
    // ...
}
```

### 4. Deploy Frontend

#### Using Python's HTTP Server (for testing)

```bash
# In the project directory
python3 -m http.server 8080

# Open in browser: http://localhost:8080
```

#### Using a Web Server (for production)

Copy all files to your web server:
- `index.html`
- `style.css`
- `script.js`
- `manifest.json`
- `sw.js`

Ensure the server supports HTTPS and serves files with correct MIME types.

### 5. Access from iPhone

1. On your iPhone Safari, navigate to your PWA URL
2. Tap the Share button → "Add to Home Screen"
3. Launch from home screen for full-screen experience

## 📱 Usage

1. **Start Detection**: Tap "Start Detection" to begin processing camera feed
2. **Pause/Resume**: Temporarily pause detection while keeping camera active
3. **Record**: Tap "Record" to start 30-second dashcam recording
4. **Settings**: Configure voice feedback, sensitivity, and API endpoint

### Detected Objects

The app detects and provides audio feedback for:
- 🛑 Stop signs
- 🚶 Crosswalks and walk signals
- 🚫 No walk signs
- ⚠️ Traffic lights
- 🚧 Hazards and obstacles
- 🚗 Speed limits

### Audio Alerts

Sample feedback messages:
- "Stop sign detected ahead. Stop."
- "Do not walk signal. Stay on curb."
- "Crosswalk detected. Proceed with caution."

## 🏗️ Project Structure

```
SignVision/
├── server.py              # FastAPI backend with Gemini API
├── index.html             # Main HTML structure
├── style.css              # Mobile-responsive styling
├── script.js              # Camera access, AR overlays, audio
├── manifest.json           # PWA manifest
├── sw.js                  # Service worker for offline support
├── requirements.txt       # Python dependencies
├── env.example           # Environment configuration template
└── README.md             # This file
```

## 🔧 Configuration

Edit `script.js` to customize:

```javascript
config: {
    apiEndpoint: 'http://your-server:8000/analyze',
    processingInterval: 1000,    // ms between frames
    enableVoice: true,             // Audio feedback on/off
    detectionSensitivity: 5,       // 1-10 scale
    maxFPS: 15,                    # Maximum frames per second
    recordDuration: 30000          // 30s dashcam recording
}
```

## 🎨 Tech Stack

### Frontend
- HTML5 (Camera API, Canvas 2D)
- CSS3 (Responsive, mobile-first design)
- JavaScript (ES6+, Fetch API, MediaRecorder)
- Web Speech API
- IndexedDB

### Backend
- Python 3.8+
- FastAPI
- Google Generative AI (Gemini 1.5 Flash)
- uvicorn ASGI server

## 🔒 Security Notes

1. **API Key**: Never commit `.env` file to version control
2. **HTTPS**: Required for camera access in production
3. **CORS**: Update CORS origins in `server.py` for production
4. **Rate Limiting**: Consider adding rate limiting to `/analyze` endpoint

## 🐛 Troubleshooting

### Camera not working
- Ensure HTTPS is enabled
- Check camera permissions in Safari Settings
- Test with `navigator.mediaDevices.getUserMedia()` in console

### API connection failed
- Verify backend server is running: `curl http://localhost:8000`
- Check API endpoint in `script.js` matches server address
- Ensure network connectivity from iPhone

### No detections
- Check Gemini API key is valid
- Monitor browser console for errors
- Verify image upload size (should be < 1MB)

### PWA not installing
- Use HTTPS (http://localhost won't work)
- Check manifest.json is accessible
- Clear cache and retry

## 📊 Performance

- **Processing Interval**: 1 second (adjustable)
- **Frame Rate**: Up to 15 FPS
- **Image Compression**: 60% quality WebP
- **Battery Impact**: Optimized with throttling

## 🚀 Production Deployment

1. Set up HTTPS certificate (Let's Encrypt recommended)
2. Configure production API endpoint
3. Add domain to CORS whitelist
4. Enable service worker caching
5. Monitor Gemini API usage and costs

## 📄 License

MIT License - feel free to use and modify for your needs.

## 🤝 Contributing

Contributions welcome! Areas for improvement:
- Additional detection types
- Better AR visualization
- Performance optimizations
- Accessibility enhancements

## 📧 Support

For issues or questions:
1. Check the troubleshooting section
2. Review browser console for errors
3. Monitor backend logs: `python server.py`

---

**Built with ❤️ for visually impaired users**
