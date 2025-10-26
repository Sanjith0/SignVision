# SignVision Troubleshooting Guide

## Connection Error When Analyzing Frames

### Check 1: Is the Server Running?

```bash
# Check if server is running
ps aux | grep "python.*server.py"

# Start the server if not running
python server.py
# OR
./run_server.sh
```

### Check 2: Verify API Endpoint

The default endpoint in `script.js` is set to `http://localhost:8000/analyze`

- **For MacBook testing**: Use `localhost`
- **For iPhone access**: Change to your Mac's IP address

To find your IP:
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
# OR
ipconfig getifaddr en0
```

Then update `script.js` line 22:
```javascript
apiEndpoint: 'http://YOUR_IP_HERE:8000/analyze',
```

Or use the Settings button in the app to change the endpoint.

### Check 3: Gemini API Key

Verify your `.env` file has a valid API key:
```bash
cat .env | grep GEMINI_API_KEY
```

If missing, copy from `env.example`:
```bash
cp env.example .env
# Then edit .env and add your API key
nano .env
```

Get a free API key from: https://makersuite.google.com/app/apikey

### Check 4: Camera Permissions

On iOS Safari, you need to grant camera permissions. The app will prompt you.

### Check 5: Browser Console

Open browser console (F12 or Cmd+Option+I) and look for errors:

**Common Errors:**

1. **"Failed to fetch"**
   - Server not running
   - Wrong IP address/endpoint
   - Network firewall blocking

2. **CORS Error**
   - Server CORS configuration issue
   - Browser security restrictions

3. **"GEMINI_API_KEY not found"**
   - `.env` file missing or misconfigured
   - Server needs restart

### Check 6: Server Logs

Check server output for errors:
```bash
# If server is running in terminal, you'll see logs
# Look for Gemini API errors or connection issues
```

### Quick Diagnostic Commands

```bash
# Check server is running
curl http://localhost:8000/

# Test API endpoint (should return JSON error about file type)
curl -X POST http://localhost:8000/analyze

# Check your IP address
ipconfig getifaddr en0

# Check if port 8000 is accessible
lsof -i :8000
```

### Still Having Issues?

1. Make sure your Mac and iPhone are on the same WiFi network
2. Try accessing from phone browser: `http://YOUR_IP:8000/` (should show API status)
3. Check Mac firewall settings (System Preferences > Security & Privacy > Firewall)
4. Restart the server after changing `.env`

