import math
import difflib
from datetime import datetime
from typing import Dict, Any, List, Tuple, Optional
import os

try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False

from app.models.report import Report
from app.services.vision_service import (
    resolve_image_path,
    compare_two_images_with_gemini,
    extract_features_from_single_image
)

def calculate_text_similarity(text1: str, text2: str) -> float:
    """Calculate text similarity using TF-IDF cosine similarity or difflib fallback."""
    if not text1 or not text2:
        return 0.0
    
    t1 = text1.strip().lower()
    t2 = text2.strip().lower()
    
    if t1 == t2:
        return 100.0

    if SKLEARN_AVAILABLE:
        try:
            vectorizer = TfidfVectorizer(stop_words='english')
            tfidf = vectorizer.fit_transform([t1, t2])
            sim = cosine_similarity(tfidf[0:1], tfidf[1:2])[0][0]
            return round(float(sim) * 100.0, 2)
        except Exception:
            pass

    # Fallback to SequenceMatcher + token overlap ratio
    seq_sim = difflib.SequenceMatcher(None, t1, t2).ratio()
    tokens1 = set(t1.split())
    tokens2 = set(t2.split())
    
    if not tokens1 or not tokens2:
        overlap_sim = 0.0
    else:
        intersection = tokens1.intersection(tokens2)
        union = tokens1.union(tokens2)
        overlap_sim = len(intersection) / len(union)

    combined = (seq_sim * 0.5) + (overlap_sim * 0.5)
    return round(combined * 100.0, 2)


def calculate_attribute_similarity(r1: Report, r2: Report) -> float:
    """Calculate category, brand, and color attribute similarity score (0-100)."""
    scores = []
    
    # 1. Category Similarity (Weight 50% of attributes)
    if r1.category.lower() == r2.category.lower():
        cat_score = 100.0
    else:
        cat_score = 0.0
    scores.append((cat_score, 0.50))
    
    # 2. Brand Similarity (Weight 30% of attributes)
    b1 = (r1.brand or "").strip().lower()
    b2 = (r2.brand or "").strip().lower()
    if b1 and b2:
        if b1 == b2 or b1 in b2 or b2 in b1:
            brand_score = 100.0
        else:
            brand_score = 0.0
    elif not b1 and not b2:
        brand_score = 70.0
    else:
        brand_score = 50.0  # One missing
    scores.append((brand_score, 0.30))
    
    # 3. Color Similarity (Weight 20% of attributes)
    c1 = (r1.color or "").strip().lower()
    c2 = (r2.color or "").strip().lower()
    if c1 and c2:
        if c1 == c2 or c1 in c2 or c2 in c1:
            color_score = 100.0
        else:
            color_score = 20.0
    else:
        color_score = 60.0
    scores.append((color_score, 0.20))
    
    total = sum(score * weight for score, weight in scores)
    return round(total, 2)


def calculate_location_similarity(loc1: str, loc2: str) -> float:
    """Calculate spatial similarity between campus location strings (0-100)."""
    if not loc1 or not loc2:
        return 30.0
    
    l1 = loc1.strip().lower()
    l2 = loc2.strip().lower()
    
    if l1 == l2:
        return 100.0
        
    tokens1 = set(l1.replace(',', '').replace('-', '').split())
    tokens2 = set(l2.replace(',', '').replace('-', '').split())
    
    intersection = tokens1.intersection(tokens2)
    if intersection:
        overlap_ratio = len(intersection) / min(len(tokens1), len(tokens2))
        if overlap_ratio >= 0.5:
            return round(85.0 + (overlap_ratio * 15.0), 2)
        return round(60.0 + (overlap_ratio * 25.0), 2)
        
    seq_sim = difflib.SequenceMatcher(None, l1, l2).ratio()
    return round(seq_sim * 70.0, 2)


def calculate_date_similarity(date_str1: str, date_str2: str) -> float:
    """Calculate temporal proximity using exponential decay based on day difference (0-100)."""
    try:
        d1 = datetime.strptime(date_str1, "%Y-%m-%d")
        d2 = datetime.strptime(date_str2, "%Y-%m-%d")
        delta_days = abs((d1 - d2).days)
        
        if delta_days == 0:
            return 100.0
            
        # Exponential decay factor lambda = 0.25
        score = 100.0 * math.exp(-0.25 * delta_days)
        return round(max(score, 5.0), 2)
    except Exception:
        return 50.0


def compute_multimodal_match(lost_report: Report, found_report: Report) -> Dict[str, Any]:
    """
    Computes complete multimodal similarity score between a Lost report and a Found report.
    Integrates Gemini Vision analysis for micro-features (keychains, marks, tags)
    and handles single-image and no-image edge cases without error.
    """
    lost_full_text = f"{lost_report.item_name} {lost_report.description} {lost_report.brand or ''} {lost_report.color or ''} {lost_report.distinctive_features or ''}"
    found_full_text = f"{found_report.item_name} {found_report.description} {found_report.brand or ''} {found_report.color or ''} {found_report.distinctive_features or ''}"
    
    # 1. Text Similarity
    text_score = calculate_text_similarity(lost_full_text, found_full_text)
    
    # 2. Attribute Similarity
    attribute_score = calculate_attribute_similarity(lost_report, found_report)
    
    # 3. Location Similarity
    location_score = calculate_location_similarity(lost_report.location, found_report.location)
    
    # 4. Date Proximity
    date_score = calculate_date_similarity(lost_report.incident_date, found_report.incident_date)
    
    # 5. Image & Vision Analysis (Gemini + Local Fallback)
    path_lost = resolve_image_path(lost_report.image_url)
    path_found = resolve_image_path(found_report.image_url)
    
    image_score = 0.0
    image_mode = "NONE"
    vision_notes = []
    
    if path_lost and path_found:
        image_mode = "BOTH"
        gemini_res = compare_two_images_with_gemini(path_lost, path_found)
        if gemini_res and "similarity_score" in gemini_res:
            image_score = float(gemini_res["similarity_score"])
            if gemini_res.get("matched_features"):
                for feat in gemini_res["matched_features"]:
                    vision_notes.append(f"✓ Gemini Vision Detected Match: {feat}")
            if gemini_res.get("explanation"):
                vision_notes.append(f"📷 Vision Analysis: {gemini_res['explanation']}")
        else:
            # Fallback if no Gemini key or offline
            image_score = 0.0
            vision_notes.append("📷 Visual compatibility baseline: No visual match detected.")
            
    elif path_lost or path_found:
        image_mode = "SINGLE"
        active_path = path_lost or path_found
        target_text = found_full_text if path_lost else lost_full_text
        
        gemini_tags = extract_features_from_single_image(active_path)
        if gemini_tags:
            extracted_items = gemini_tags.get("distinctive_features", []) + gemini_tags.get("colors", [])
            matches = []
            for item in extracted_items:
                if str(item).lower() in target_text.lower():
                    matches.append(item)
            if matches:
                image_score = round(min(100.0, text_score + 20.0), 2)
                vision_notes.append(f"✓ Image-to-Text Match: Image visual feature(s) '{', '.join(matches)}' verified in description.")
            else:
                image_score = round(text_score * 0.85, 2)
                vision_notes.append("ℹ 1 Image Analyzed: Visual attributes cross-referenced with report text.")
        else:
            image_score = round(text_score * 0.85, 2)
            vision_notes.append("ℹ Single photo provided; visual score adjusted via text correlation.")
    else:
        image_mode = "NONE"
        image_score = round(text_score * 0.80, 2)

    # Dynamic Weight Rebalancing
    if image_mode == "BOTH":
        # If visual evidence strongly conflicts (image_score < 20%), apply visual mismatch penalty
        if image_score < 20.0:
            vision_notes.append("⚠ Visual Mismatch: Uploaded photographs show clearly distinct items.")
            overall_score = (
                (0.20 * text_score) +
                (0.40 * image_score) +
                (0.15 * attribute_score) +
                (0.15 * location_score) +
                (0.10 * date_score)
            )
            # Cap overall score to prevent false positive match
            overall_score = min(overall_score, 35.0)
        else:
            # Balanced 5-way ensemble
            overall_score = (
                (0.30 * text_score) +
                (0.25 * image_score) +
                (0.20 * attribute_score) +
                (0.15 * location_score) +
                (0.10 * date_score)
            )
    elif image_mode == "SINGLE":
        # Mildly reduce image weight, boost text and attributes
        overall_score = (
            (0.35 * text_score) +
            (0.15 * image_score) +
            (0.25 * attribute_score) +
            (0.15 * location_score) +
            (0.10 * date_score)
        )
    else:
        # 0 images: redistribute image weight completely into text, attributes & spatial
        overall_score = (
            (0.40 * text_score) +
            (0.25 * attribute_score) +
            (0.20 * location_score) +
            (0.15 * date_score)
        )

    overall_score = round(max(0.0, min(100.0, overall_score)), 2)
    
    # Determine Confidence Level
    if overall_score >= 75.0:
        confidence_level = "HIGH"
    elif overall_score >= 45.0:
        confidence_level = "MEDIUM"
    else:
        confidence_level = "LOW"
        
    # Generate Explainable AI (XAI) rationale bullets
    explanations = []
    
    # Category reasoning
    if lost_report.category.lower() == found_report.category.lower():
        explanations.append(f"✓ Exact Category Match: Both items categorized as '{lost_report.category}'.")
    else:
        explanations.append(f"⚠ Category Mismatch: Lost is '{lost_report.category}' while Found is '{found_report.category}'.")
        
    # Text reasoning
    if text_score >= 70.0:
        explanations.append(f"✓ High Text Similarity ({text_score}%): Strong overlap in item titles and key descriptions.")
    elif text_score >= 40.0:
        explanations.append(f"ℹ Moderate Text Similarity ({text_score}%): Partial textual overlap in keywords.")
    else:
        explanations.append(f"⚠ Low Text Similarity ({text_score}%): Descriptions differ significantly.")
        
    # Brand/Color reasoning
    if lost_report.brand and found_report.brand and lost_report.brand.lower() == found_report.brand.lower():
        explanations.append(f"✓ Brand Match: Both identify manufacturer as '{lost_report.brand}'.")
    if lost_report.color and found_report.color and lost_report.color.lower() in found_report.color.lower():
        explanations.append(f"✓ Color Match: Compatible color profile ({lost_report.color} / {found_report.color}).")

    # Distinctive features keyword overlap
    d1 = (lost_report.distinctive_features or "").strip().lower()
    d2 = (found_report.distinctive_features or "").strip().lower()
    if d1 and d2:
        common_words = set(d1.split()).intersection(set(d2.split()))
        stop_words = {"the", "a", "an", "and", "or", "in", "on", "at", "with", "is"}
        sig_words = [w for w in common_words if w not in stop_words and len(w) > 2]
        if sig_words:
            explanations.append(f"✓ Key Detail Match: Shared distinctive keyword(s): '{', '.join(sig_words)}'.")

    # Spatial reasoning
    if location_score >= 80.0:
        explanations.append(f"✓ High Spatial Proximity ({location_score}%): Reported in same campus zone ('{lost_report.location}').")
    elif location_score >= 50.0:
        explanations.append(f"ℹ Moderate Location Proximity ({location_score}%): Nearby campus locations.")
        
    # Temporal reasoning
    if date_score >= 90.0:
        explanations.append(f"✓ Immediate Time Proximity ({date_score}%): Reported on same or consecutive dates ({lost_report.incident_date}).")
    elif date_score >= 50.0:
        explanations.append(f"ℹ Close Date Window ({date_score}%): Incident dates occurred within 3-5 days.")
    else:
        explanations.append(f"⚠ Distant Date Window ({date_score}%): Incident dates differ by more than a week.")

    # Vision notes from Gemini/Image analysis
    explanations.extend(vision_notes)

    return {
        "overall_score": overall_score,
        "confidence_level": confidence_level,
        "text_score": text_score,
        "image_score": image_score,
        "location_score": location_score,
        "date_score": date_score,
        "attribute_score": attribute_score,
        "explanation": explanations,
        "explanations": explanations
    }
