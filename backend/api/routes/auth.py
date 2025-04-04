from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload 
from backend.db.database import get_db
from backend.db.models import User, Role
from backend.core.auth import verify_password, create_access_token, hash_password, generate_temp_password, decode_access_token
from backend.core.dependencies import get_current_user
from backend.utils.email import (
    send_invitation_email,
    send_password_changed_email,
    send_reset_password_email
)
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta

router = APIRouter(prefix="/auth")

# Durée de validité du token de réinitialisation de mot de passe (en minutes)
RESET_TOKEN_EXPIRE_MINUTES = 30

# ============================
# 🔐 SCHEMAS
# ============================

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    first_name: str
    last_name: str
    birth_date: str
    email: str
    password: str
    roles: list[str] = ["employee"]

class PasswordChangeRequest(BaseModel):
    new_password: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

# ============================
# 🔐 AUTHENTIFICATION
# ============================

@router.post("/login")
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)):
    stmt = select(User).where(User.email == request.email).options(selectinload(User.roles))
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({
        "sub": str(user.id),
        "roles": [role.name for role in user.roles]
    })

    # ✅ On retourne aussi s'il faut forcer un changement de mot de passe
    return {
        "access_token": token,
        "token_type": "bearer",
        "must_change_password": user.must_change_password
    }

@router.put("/change-password-on-first-login")
async def change_password_on_first_login(
    req: PasswordChangeRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = select(User).where(User.id == current_user.id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")

    user.hashed_password = hash_password(req.new_password)
    user.must_change_password = False
    await db.commit()

    await send_password_changed_email(db, user.email, user.first_name)

    return {"message": "Mot de passe mis à jour ✅"}

# ============================
# 🧑‍💼 INSCRIPTION
# ============================

@router.post("/register")
async def register(request: RegisterRequest, db: AsyncSession = Depends(get_db)):
    # Vérifie si l'email est déjà utilisé
    stmt = select(User).where(User.email == request.email)
    result = await db.execute(stmt)
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email déjà utilisé")

    # Récupération des rôles
    roles_stmt = select(Role).where(Role.name.in_(request.roles))
    roles_result = await db.execute(roles_stmt)
    roles = roles_result.scalars().all()

    # Conversion de la date de naissance
    try:
        birth_date = datetime.strptime(request.birth_date, "%Y-%m-%d").date() if request.birth_date else None
    except ValueError:
        raise HTTPException(status_code=400, detail="Format de date invalide")

    # Génération mot de passe temporaire
    temp_password = generate_temp_password()
    hashed_pwd = hash_password(temp_password)

    user = User(
        first_name=request.first_name,
        last_name=request.last_name,
        birth_date=birth_date,
        email=request.email,
        hashed_password=hashed_pwd,
        roles=roles,
        is_active=True,
        must_change_password=True,  # 🔐 Oblige changement à la 1ère connexion
    )

    db.add(user)
    await db.commit()

    await send_invitation_email(db, to_email=user.email, temp_password=temp_password)

    return {"message": "Utilisateur créé ✅ - Invitation envoyée", "email": user.email}

# ============================
# 👤 RÉCUPÉRATION DU PROFIL
# ============================

@router.get("/me")
async def get_me(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    stmt = (
        select(User)
        .options(selectinload(User.roles))
        .where(User.id == current_user.id)
    )
    result = await db.execute(stmt)
    user = result.scalar_one()

    return {
        "id": user.id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "roles": [role.name for role in user.roles],
        "language": current_user.language,
        "date_format": current_user.date_format,
        "theme": current_user.theme
    }

# ============================
# 🔁 MOT DE PASSE OUBLIÉ
# ============================

@router.post("/forgot-password")
async def forgot_password(data: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    stmt = select(User).where(User.email == data.email)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="Aucun utilisateur avec cet e-mail")

    # Génère un token temporaire JWT valable 30 min
    token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(minutes=RESET_TOKEN_EXPIRE_MINUTES)
    )

    await send_reset_password_email(db, to_email=user.email, reset_token=token)
    return {"message": "Email de réinitialisation envoyé ✅"}

@router.post("/reset-password")
async def reset_password(data: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    try:
        payload = decode_access_token(data.token)
        user_id = int(payload.get("sub"))
    except Exception:
        raise HTTPException(status_code=400, detail="Token invalide ou expiré")

    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")

    user.hashed_password = hash_password(data.new_password)
    await db.commit()

    return {"message": "Mot de passe réinitialisé avec succès ✅"}
