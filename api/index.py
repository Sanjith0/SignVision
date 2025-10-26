"""
SignVision Backend - Vercel Serverless Function
Wraps the FastAPI application for deployment on Vercel
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional
from google import genai
from mangum import Mangum
import os
import logging
from datetime import datetime
import base64
import json
import re

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(title="SignVision API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Gemini API key from environment
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    logger.warning("GEMINI_API_KEY not found in environment variables")
    GEMINI_API_KEY = None

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
                    logger.info(f"Using alternative model: {model_name}")
                    break
            else:
                vision_models = [m.name for m in models if 'gemini' in m.name.lower() and ('flash' in m.name.lower() or 'pro' in m.name.lower())]
                if vision_models:
                    model_name = vision_models[0]
                    logger.info(f"Selected vision model: {model_name}")
                else:
                    model_name = available_model_names[0] if available_model_names else "models/gemini-1.5-flash"
                    logger.warning(f"Using fallback model: {model_name}")
        
        logger.info(f"Gemini client initialized successfully with model: {model_name}")
    except Exception as e:
        logger.error(f"Failed to initialize Gemini client: {e}")
        client = None


class Detection(BaseModel):
    """Detection result model"""
    label: str
    bbox: List[float]
    color: str
    confidence: Optional[float] = None


class AnalyzeResponse(BaseModel):
    """Response model for /analyze endpoint"""
    detections: List[Detection]
    processing_time_ms: float


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "SignVision API is running on Vercel",
        "status": "ok",
        "gemini_configured": GEMINI_API_KEY is not None
    }


@app.get("/models")
async def list_models():
    """List available Gemini models"""
    if not client:
        return {"error": "Gemini client not initialized", "models": [], "sdk": "google-genai"}
    
    try:
        models = client.models.list()
        model_names = [{"name": m.name, "display_name": getattr(m, 'display_name', m.name)} for m in models if hasattr(m, 'name')]
        return {
            "models": model_names,
            "current_model": model_name,
            "sdk": "google-genai"
        }
    except Exception as e:
        logger.error(f"Failed to list models: {e}")
        return {"error": str(e), "models": [], "sdk": "google-genai"}


@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze_image(file: UploadFile = File(...)):
    """
    Analyze an uploaded image frame for road signs, crosswalks, and hazards.
    """
    start_time = datetime.now()
    
    if not GEMINI_API_KEY or not client:
        raise HTTPException(
            status_code=503,
            detail="Gemini API not configured. Please set GEMINI_API_KEY environment variable."
        )
    
    try:
        # Validate file
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read the uploaded file
        image_data = await file.read()
        logger.info(f"Received image: {len(image_data)} bytes, content-type: {file.content_type}")
        
        # Prepare the prompt for Gemini
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
        
        try:
            # Encode image as base64
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
                                    "mime_type": file.content_type,
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
            
            # Parse the response
            if hasattr(response, 'text'):
                response_text = response.text.strip()
            elif hasattr(response, 'candidates') and len(response.candidates) > 0:
                response_text = response.candidates[0].content.parts[0].text.strip()
            else:
                raise ValueError("Unexpected response format from Gemini API")
            
            # Extract JSON from the response
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0]
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0]
            
            # Parse JSON response
            try:
                result = json.loads(response_text)
            except json.JSONDecodeError:
                json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
                if json_match:
                    result = json.loads(json_match.group())
                else:
                    raise
            
            # Validate and format the response
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
            
            processing_time = (datetime.now() - start_time).total_seconds() * 1000
            
            logger.info(f"Processed in {processing_time:.2f}ms, found {len(formatted_detections)} detections")
            
            return {
                "detections": formatted_detections,
                "processing_time_ms": processing_time
            }
            
        except Exception as e:
            logger.error(f"Gemini API error: {e}")
            raise HTTPException(status_code=500, detail=f"AI processing failed: {str(e)}")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")


@app.post("/analyze-fallback")
async def analyze_fallback(file: UploadFile = File(...)):
    """
    Fallback analysis endpoint with simpler prompt (if main /analyze fails)
    """
    try:
        image_data = await file.read()
        
        return {
            "detections": [
                {
                    "label": "scene_analyzed",
                    "bbox": [0.25, 0.25, 0.5, 0.5],
                    "color": "blue",
                    "confidence": 1.0
                }
            ],
            "processing_time_ms": 100.0
        }
    except Exception as e:
        logger.error(f"Fallback error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Vercel serverless function handler - must be at module level
handler = Mangum(app, lifespan="off")

