import random
import difflib
from typing import Dict, Any, List, Tuple

# Predefined Campus Landmarks and Buildings with standardized Map Coordinates (x, y % on vector map)
CAMPUS_LOCATIONS: List[Dict[str, Any]] = [
    {
        "id": "central_library",
        "name": "Central Library & Study Quads",
        "zone": "North Academic Quad",
        "x": 28.0,
        "y": 32.0,
        "icon": "library",
        "description": "Main library, reading halls, group study rooms, quiet floors, and digital repository.",
        "keywords": ["library", "study", "reading hall", "stack", "book", "desk", "quiet room", "librarian"]
    },
    {
        "id": "engineering_complex",
        "name": "Engineering & Technology Wing",
        "zone": "Tech Park",
        "x": 72.0,
        "y": 28.0,
        "icon": "cpu",
        "description": "Computer Science labs (Lab 101/102), robotics center, IoT testbeds, and mechanical workshops.",
        "keywords": ["engineering", "lab", "computer", "robotics", "iot", "tech", "cs302", "hardware", "coding"]
    },
    {
        "id": "science_block",
        "name": "Science Block & Main Auditoriums",
        "zone": "East Academic Quad",
        "x": 58.0,
        "y": 48.0,
        "icon": "flask",
        "description": "Physics & chemistry lecture theatres, central seminar auditorium, and research facilities.",
        "keywords": ["science", "auditorium", "seminar", "theatre", "hall", "physics", "chemistry", "lecture"]
    },
    {
        "id": "main_cafeteria",
        "name": "Main Cafeteria & Food Plaza",
        "zone": "Student Central",
        "x": 42.0,
        "y": 62.0,
        "icon": "utensils",
        "description": "Central food court, indoor/outdoor dining booths, coffee shop, and student convenience hub.",
        "keywords": ["cafeteria", "canteen", "food", "dining", "lunch", "coffee", "snack", "table", "cafe"]
    },
    {
        "id": "sports_complex",
        "name": "Sports Complex & Gym Lockers",
        "zone": "South Athletics Wing",
        "x": 80.0,
        "y": 76.0,
        "icon": "trophy",
        "description": "Indoor gymnasium, basketball courts, fitness gym, student locker rooms, and track field.",
        "keywords": ["sports", "gym", "court", "locker", "basketball", "football", "track", "fitness", "ground"]
    },
    {
        "id": "student_activity_center",
        "name": "Student Activity Center & Clubs",
        "zone": "Student Central",
        "x": 26.0,
        "y": 72.0,
        "icon": "users",
        "description": "Student council offices, cultural club rooms, music studio, and recreation lounge.",
        "keywords": ["activity", "center", "club", "council", "music", "lounge", "recreation", "hall"]
    },
    {
        "id": "admin_security_block",
        "name": "Admin Block & Campus Security Desk",
        "zone": "Main Gate Gateway",
        "x": 15.0,
        "y": 50.0,
        "icon": "shield",
        "description": "Chancellor's office, registrar, admissions office, and 24/7 central campus security lost & found outpost.",
        "keywords": ["admin", "security", "gate", "registrar", "entrance", "office", "desk", "guard", "main entrance"]
    },
    {
        "id": "north_parking",
        "name": "North Parking & Bike Stands",
        "zone": "North Transit Hub",
        "x": 20.0,
        "y": 15.0,
        "icon": "car",
        "description": "Student two-wheeler parking, faculty vehicle lot, and north perimeter EV charging docks.",
        "keywords": ["north parking", "parking", "bike", "bicycle", "cycle", "car", "vehicle", "scooter", "stand"]
    },
    {
        "id": "south_transit_terminal",
        "name": "South Gate Transit & Bus Bay",
        "zone": "South Transit Hub",
        "x": 60.0,
        "y": 88.0,
        "icon": "bus",
        "description": "Campus shuttle stop, city transit bus bay, taxi drop-off, and pedestrian south gate.",
        "keywords": ["transit", "bus", "shuttle", "south gate", "terminal", "drop", "stop", "station"]
    }
]

DEFAULT_CAMPUS_LOCATION = CAMPUS_LOCATIONS[0]


def resolve_campus_location(location_str: str, seed_id: int = 0) -> Tuple[Dict[str, Any], float, float]:
    """
    Fuzzy resolves a user-submitted location text string to a standard campus location and returns
    the matched campus location object along with dispersed (x, y) percentage map coordinates.
    """
    if not location_str:
        loc = DEFAULT_CAMPUS_LOCATION
        return loc, loc["x"], loc["y"]

    cleaned = location_str.lower().strip()

    best_match = None
    best_score = -1.0

    for loc in CAMPUS_LOCATIONS:
        score = 0.0
        # Check direct keyword matches
        for kw in loc["keywords"]:
            if kw in cleaned:
                score += 3.0
            elif kw in cleaned.replace("-", " ").replace(",", " ").split():
                score += 2.0

        # Check location name similarity
        name_sim = difflib.SequenceMatcher(None, cleaned, loc["name"].lower()).ratio()
        score += name_sim * 2.0

        if score > best_score:
            best_score = score
            best_match = loc

    if not best_match or best_score < 0.5:
        # Fallback to default or hash-based determinism
        idx = abs(hash(cleaned)) % len(CAMPUS_LOCATIONS)
        best_match = CAMPUS_LOCATIONS[idx]

    # Add slight deterministic jitter to coordinate so multiple items at same building do not perfectly overlap
    rng = random.Random(seed_id if seed_id > 0 else abs(hash(cleaned)))
    jitter_x = (rng.random() - 0.5) * 5.0  # +/- 2.5%
    jitter_y = (rng.random() - 0.5) * 5.0  # +/- 2.5%

    coord_x = round(max(5.0, min(95.0, best_match["x"] + jitter_x)), 2)
    coord_y = round(max(5.0, min(95.0, best_match["y"] + jitter_y)), 2)

    return best_match, coord_x, coord_y


def get_all_campus_locations() -> List[Dict[str, Any]]:
    """Returns the list of all registered campus landmarks."""
    return CAMPUS_LOCATIONS
