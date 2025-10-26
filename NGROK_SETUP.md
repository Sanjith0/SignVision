# Ngrok Setup for SignVision

## The Problem

When you access the app via ngrok on port 8080, the JavaScript code tries to connect to `http://localhost:8000/analyze`. But from the browser's perspective, `localhost` refers to the ngrok tunnel, not your Mac!

## The Solution: Two Options

### Option 1: Run TWO ngrok Tunnels (Recommended)

Run ngrok for BOTH ports:

**Terminal 1 - Backend (port 8000):**
```bash
ngrok http 8000
```
Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

**Terminal 2 - Frontend (port 8080):**
```bash
ngrok http 8080  
```
Copy the HTTPS URL (e.g., `https://xyz789.ngrok.io`)

**Terminal 3 - Python Server:**
```bash
python server.py
```

**Terminal 4 - HTTP Server:**
```bash
python3 -m http.server 8080
```

**Then update the app** to use the backend ngrok URL:

1. Open the ngrok URL in your browser (the one for port 8080)
2. Click the ⚙️ Settings button
3. Change API Endpoint to: `https://abc123.ngrok.io/analyze` (use your backend ngrok URL)

### Option 2: Use Same Port (Alternative Setup)

Run everything on port 8000 and use FastAPI's static file serving:

**Modify server.py** to serve static files (I can help with this if you want)

Then run:
```bash
ngrok http 8000
```

Access: `https://your-ngrok-url.ngrok.io`

The app will be available at the root, and API at `/analyze`.

## Quick Start (Option 1 - Two Tunnels)

```bash
# Terminal 1 - Start backend
python server.py

# Terminal 2 - Start frontend
python3 -m http.server 8080

# Terminal 3 - Ngrok for backend
ngrok http 8000

# Terminal 4 - Ngrok for frontend  
ngrok http 8080

# Then update the API endpoint in the app to use the backend ngrok URL
```

## Testing the Connection

1. Start both ngrok tunnels
2. Open the frontend ngrok URL in browser
3. Update API endpoint in Settings to backend ngrok URL
4. Click "Start Detection"
5. Should work!

