from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from backend.api.router import router as api_router
from backend.core.auth import get_current_user
from backend.db.models import User


app = FastAPI(
    title="ElStudio API",
    description="API de gestion ElStudio",
    version="1.0.0"
)

# ✅ Middleware CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Ou ["*"] temporairement
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Route de test avec utilisateur connecté
@app.get("/me")
async def read_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "roles": [role.name for role in current_user.roles]
    }

# ✅ Ajout des routes principales
app.include_router(api_router)
