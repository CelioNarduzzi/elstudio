from fastapi import APIRouter
from backend.api.routes import auth, users, roles, organization

router = APIRouter()
router.include_router(auth.router)
router.include_router(users.router)
router.include_router(roles.router)
router.include_router(organization.router) 
