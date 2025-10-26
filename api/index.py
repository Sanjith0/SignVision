"""
SignVision Backend - Vercel Serverless Function (Native)
Simple HTTP handler for Vercel without FastAPI/Mangum
"""

from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
from google import genai
import os
import json
import base64
import re
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load Gemini API key
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Initialize Gemini client
client = None
model_name = None

if GEMINI_API_KEY:
    try:
        client = genai.Client(api_key=GEMINI_API_KEY)
        models = client.models.list()
        model_name = "models/gemini-2.0-flash"
        
        available_model_names = [m.name for m in models]
        
        if model_name not in available_model_names:
            for alt in ["models/gemini-2.5-flash", "models/gemini-1.5-flash", "models/gemini-flash-latest"]:
                if alt in available_model_names:
                    model_name = alt
                    break
            else:
                vision_models = [m.name for m in models if 'gemini' in m.name.lower() and ('flash' in m.name.lower() or 'pro' in m.name.lower())]
                if vision_models:
                    model_name = vision_models[0]
                else:
                    model_name = available_model_names[0] if available_model_names else "models/gemini-1.5-flash"
        
        logger.info(f"Gemini initialized with model: {model_name}")
    except Exception as e:
        logger.error(f"Failed to initialize Gemini: {e}")
        client = None


class handler(BaseHTTPRequestHandler):
    """Vercel serverless function handler"""
    
    def do_GET(self):
        """Handle GET requests"""
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        response = {
            "message": "SignVision API is running on Vercel",
            "status": "ok",
            "gemini_configured": GEMINI_API_KEY is not None and client is not None
        }
        
        self.wfile.write(json.dumps(response).encode())
    
    def do_POST(self):
        """Handle POST requests (image analysis)"""
        try:
            # Check if Gemini is configured
            if not GEMINI_API_KEY or not client:
                self.send_error(503, "Gemini API not configured")
                return
            
            # Read request body
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            
            # Parse multipart form data (simplified)
            # In production, you'd want proper multipart parsing
            # For now, assume the image is sent as raw bytes or base64
            
            try:
                # Try to parse as JSON first
                data = json.loads(body.decode('utf-8'))
                if 'image' in data:
                    image_data = base64.b64decode(data['image'])
                    content_type = data.get('content_type', 'image/jpeg')
                else:
                    # Assume raw image bytes
                    image_data = body
                    content_type = self.headers.get('Content-Type', 'image/jpeg')
            except:
                # Raw image bytes
                image_data = body
                content_type = self.headers.get('Content-Type', 'image/jpeg')
            
            logger.info(f"Processing image: {len(image_data)} bytes")
            
            # Gemini prompt
            prompt = """
            Analyze this street scene image and detect the following:
            1. Traffic signs (stop signs, no walk signs, walk signs, speed limits, etc.)
            2. Crosswalk signals (walk/don't walk pedestrian signals)
            3. Crosswalk markings (zebra stripes, painted crosswalks)
            4. Potential hazards (obstacles, debris, pedestrians, vehicles)
            
            For each detection, provide:
            - label: a short description (e.g., "stop_sign", "no_walk", "crosswalk", "hazard")
            - bbox: bounding box coordinates [x, y, width, height] normalized to 0-1
            - color: "red" for hazards/no signs, "yellow" for caution, "green" for safe/proceed
            
            Return your response in this exact JSON format:
            {
                "detections": [
                    {"label": "stop_sign", "bbox": [0.2, 0.1, 0.15, 0.15], "color": "red"},
                    {"label": "crosswalk", "bbox": [0.1, 0.7, 0.3, 0.2], "color": "green"}
                ]
            }
            
            Only respond with the JSON object, no additional text.
            """
            
            # Encode image
            image_bytes = base64.b64encode(image_data).decode('utf-8')
            
            # Call Gemini API
            response = client.models.generate_content(
                model=model_name,
                contents=[
                    {
                        "role": "user",
                        "parts": [
                            {"text": prompt},
                            {
                                "inline_data": {
                                    "mime_type": content_type,
                                    "data": image_bytes
                                }
                            }
                        ]
                    }
                ],
                config={
                    "temperature": 0.3,
                    "max_output_tokens": 2048,
                }
            )
            
            # Parse response
            if hasattr(response, 'text'):
                response_text = response.text.strip()
            elif hasattr(response, 'candidates') and len(response.candidates) > 0:
                response_text = response.candidates[0].content.parts[0].text.strip()
            else:
                raise ValueError("Unexpected response format")
            
            # Extract JSON
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0]
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0]
            
            # Parse JSON
            try:
                result = json.loads(response_text)
            except json.JSONDecodeError:
                json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
                if json_match:
                    result = json.loads(json_match.group())
                else:
                    raise
            
            # Format detections
            detections = result.get("detections", [])
            formatted_detections = []
            for det in detections:
                if "label" in det and "bbox" in det:
                    formatted_detections.append({
                        "label": det["label"],
                        "bbox": det["bbox"],
                        "color": det.get("color", "yellow"),
                        "confidence": det.get("confidence", 0.85)
                    })
            
            logger.info(f"Found {len(formatted_detections)} detections")
            
            # Send response
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            response_data = {
                "detections": formatted_detections,
                "processing_time_ms": 1000.0
            }
            
            self.wfile.write(json.dumps(response_data).encode())
            
        except Exception as e:
            import traceback
            error_details = traceback.format_exc()
            logger.error(f"Error processing request: {e}")
            logger.error(f"Full traceback: {error_details}")
            self.send_error(500, str(e))
    
    def do_OPTIONS(self):
        """Handle CORS preflight"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
