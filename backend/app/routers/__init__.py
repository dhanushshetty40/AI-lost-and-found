from app.routers.auth import router as auth_router
from app.routers.users import router as users_router
from app.routers.admin import router as admin_router
from app.routers.reports import router as reports_router
from app.routers.matches import router as matches_router
from app.routers.claims import router as claims_router
from app.routers.notifications import router as notifications_router
from app.routers.analytics import router as analytics_router
from app.routers.lifecycle import router as lifecycle_router
from app.routers.experiments import router as experiments_router

__all__ = [
    "auth_router", "users_router", "admin_router",
    "reports_router", "matches_router", "claims_router",
    "notifications_router", "analytics_router",
    "lifecycle_router", "experiments_router"
]
