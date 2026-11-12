import os
import json
import logging
from typing import Dict, Any, Optional, List, Tuple
from app.config import settings

logger = logging.getLogger(__name__)

try:
    from PIL import Image
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False

try:
    from google import genai
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False


def get_genai_client():
    """Initializes Google GenAI Client if API key is present."""
    api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "")
    if GENAI_AVAILABLE and api_key and api_key.strip():
        try:
            return genai.Client(api_key=api_key.strip())
        except Exception as e:
            logger.warning(f"Failed to initialize Gemini GenAI client: {e}")
            return None
    return None


def resolve_image_path(img_url: Optional[str]) -> Optional[str]:
    """Resolves stored image URL to local file path in backend/uploads."""
    if not img_url:
        return None
    clean = img_url.replace("/uploads/", "").replace("uploads/", "").strip()
    full_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "..", "uploads", clean)
    full_path = os.path.normpath(full_path)
    if os.path.exists(full_path) and os.path.isfile(full_path):
        return full_path
    return None


def extract_features_from_single_image(img_path: str) -> Optional[Dict[str, Any]]:
    """Uses Gemini Vision to detect key visual attributes, colors, and micro-features like keychains, scratches, tags."""
    client = get_genai_client()
    if not client or not PIL_AVAILABLE or not os.path.exists(img_path):
        return None

    try:
        img = Image.open(img_path)
        prompt = (
            "Analyze this lost/found item photo carefully. Identify:\n"
            "1. Primary object category and item name.\n"
            "2. Primary colors and secondary colors.\n"
            "3. Brand logos or text visible.\n"
            "4. Specific distinctive micro-features (e.g. keychains, stickers, pins, zipper tags, scratches, patterns, wear).\n"
            "Return strictly valid JSON with keys: category, colors (list), brand, distinctive_features (list), brief_summary."
        )
        response = client.models.generate_content(
            model="gemini-3.5-flash-lite",
            contents=[img, prompt]
        )
        text = response.text.strip()
        # Clean potential markdown wrapping
        if text.startswith("```json"):
            text = text[7:]
        if text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        return json.loads(text.strip())
    except Exception as e:
        logger.warning(f"Gemini single image analysis error: {e}")
        return None


def compare_two_images_with_gemini(img_path1: str, img_path2: str) -> Optional[Dict[str, Any]]:
    """Uses Gemini Vision to compare two item photos side by side."""
    client = get_genai_client()
    if not client or not PIL_AVAILABLE or not os.path.exists(img_path1) or not os.path.exists(img_path2):
        return None

    try:
        img1 = Image.open(img_path1)
        img2 = Image.open(img_path2)
        prompt = (
            "You are an expert lost and found visual verifier.\n"
            "Compare Image 1 (Lost item) and Image 2 (Found item).\n"
            "Determine if they appear to be the same item.\n"
            "Pay close attention to distinctive micro-features like keychains, stickers, zippers, scratches, marks, model details, and color palettes.\n"
            "Respond strictly in valid JSON format with keys:\n"
            "{\n"
            '  "similarity_score": <number between 0 and 100>,\n'
            '  "matched_features": [<list of specific features matching in both, e.g. "Cartoon keychain on zipper", "Black leather strap">],\n'
            '  "mismatches": [<list of clear differences>],\n'
            '  "verdict": "<HIGH_CONFIDENCE_MATCH | POTENTIAL_MATCH | UNLIKELY_MATCH>",\n'
            '  "explanation": "<Concise 1-2 sentence explanation>"\n'
            "}"
        )
        response = client.models.generate_content(
            model="gemini-3.5-flash-lite",
            contents=[img1, img2, prompt]
        )
        text = response.text.strip()
        if text.startswith("```json"):
            text = text[7:]
        if text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        return json.loads(text.strip())
    except Exception as e:
        logger.warning(f"Gemini two-image comparison error: {e}")
        return None

