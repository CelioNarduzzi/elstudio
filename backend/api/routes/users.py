from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete
from sqlalchemy.orm import selectinload, joinedload
from backend.db.database import get_db
from backend.db.models import User, Role, user_roles
from backend.core.auth import hash_password
from pydantic import BaseModel
from datetime import datetime, date
from backend.core.dependencies import has_role, get_current_user
from typing import List, Optional

# Routeur principal pour la gestion des utilisateurs
router = APIRouter(prefix="/users")

# -------------------- #
# Schémas de données   #
# -------------------- #

# Requête pour mettre à jour son propre profil
class UpdateProfileRequest(BaseModel):
    first_name: str
    last_name: str
    birth_date: Optional[str] = None  
    email: str
    password: Optional[str] = None
    language: Optional[str] = None
    date_format: Optional[str] = None
    theme: Optional[str] = None  
    roles: list[str] = []

# Requête pour création d'un nouvel utilisateur
class CreateUserRequest(BaseModel):
    first_name: str
    last_name: str
    birth_date: Optional[str] = None
    email: str
    password: str
    roles: list[str] = []

# Réponse de base pour afficher un utilisateur (sans les rôles)
class UserOut(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    is_active: bool

    class Config:
        orm_mode = True

# Requête pour modifier un utilisateur en tant qu'admin
class UpdateUserRequest(BaseModel):
    first_name: str
    last_name: str
    email: str
    birth_date: Optional[str] = None
    language: Optional[str]
    date_format: Optional[str]
    theme: Optional[str]
    is_active: Optional[bool] = True
    password: Optional[str] = None
    roles: list[str] = []

# Schéma de rôle pour réponse
class RoleOut(BaseModel):
    id: int
    name: str

    class Config:
        orm_mode = True

# Schéma de réponse utilisateur avec ses rôles
class UserOutWithRoles(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    birth_date: date
    is_active: bool
    roles: List[RoleOut]

    class Config:
        orm_mode = True


# --------------------------------------------- #
# Endpoint : liste de tous les utilisateurs     #
# --------------------------------------------- #
@router.get("/", response_model=List[UserOutWithRoles])
async def list_users(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(has_role(["super_admin"]))  # Restreint aux super_admins
):
    result = await db.execute(select(User).options(joinedload(User.roles)))
    users = result.unique().scalars().all()
    return users


# ---------------------------------------------------- #
# Endpoint : mise à jour de son propre profil utilisateur
# ---------------------------------------------------- #
@router.put("/me")
async def update_profile(
    data: UpdateProfileRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Vérifie qu'aucun autre utilisateur ne possède cet email
    stmt = select(User).where(User.email == data.email, User.id != current_user.id)
    result = await db.execute(stmt)
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Cet email est déjà utilisé.")

    # Mise à jour des champs
    current_user.first_name = data.first_name
    current_user.last_name = data.last_name
    current_user.email = data.email

    if data.birth_date:
        try:
            current_user.birth_date = datetime.strptime(data.birth_date, "%Y-%m-%d").date()
        except ValueError:
            raise HTTPException(status_code=400, detail="Date de naissance invalide")

    if data.password:
        current_user.hashed_password = hash_password(data.password)

    if data.theme:
        current_user.theme = data.theme

    if data.language:
        current_user.language = data.language

    if data.date_format:
        current_user.date_format = data.date_format

    await db.commit()
    return {"message": "Profil mis à jour avec succès ✅"}


# ---------------------------------------------------- #
# Endpoint : récupérer les détails d'un utilisateur    #
# ---------------------------------------------------- #
@router.get("/{user_id}")
async def get_user(user_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(User).options(joinedload(User.roles)).where(User.id == user_id)
    )
    user = result.unique().scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")

    return {
        "id": user.id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "birth_date": user.birth_date,
        "created_at": user.created_at,
        "language": user.language,
        "date_format": user.date_format,
        "theme": user.theme,
        "is_active": user.is_active,
        "roles": [{"id": r.id, "name": r.name} for r in user.roles],
    }


# --------------------------------------------------- #
# Endpoint : mise à jour d’un utilisateur (admin)     #
# --------------------------------------------------- #
@router.put("/{user_id}")
async def update_user(
    user_id: int,
    data: UpdateUserRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Vérifie que l'utilisateur connecté est super admin
    if not any(role.name == "super_admin" for role in current_user.roles):
        raise HTTPException(status_code=403, detail="Accès refusé")

    # Récupère l'utilisateur avec ses rôles
    result = await db.execute(
        select(User).options(selectinload(User.roles)).where(User.id == user_id)
    )
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")

    # Traitement de la date de naissance
    if data.birth_date:
        try:
            user.birth_date = datetime.strptime(data.birth_date, "%Y-%m-%d").date()
        except ValueError:
            raise HTTPException(status_code=400, detail="Format de date invalide")

    # Mise à jour du mot de passe
    if data.password:
        user.hashed_password = hash_password(data.password)

    # Mise à jour des rôles
    if data.roles:
        roles_result = await db.execute(select(Role).where(Role.name.in_(data.roles)))
        roles = roles_result.scalars().all()
        user.roles.clear()
        user.roles.extend(roles)

    # Mise à jour des autres champs
    for key, value in data.dict(exclude_unset=True, exclude={"birth_date", "password", "roles"}).items():
        setattr(user, key, value)

    await db.commit()
    await db.refresh(user)
    return {"message": "Utilisateur mis à jour ✅"}


# --------------------------------------------------- #
# Endpoint : suppression d’un utilisateur (super admin)
# --------------------------------------------------- #
@router.delete("/{user_id}", dependencies=[Depends(has_role(["super_admin"]))])
async def delete_user(user_id: int, db: AsyncSession = Depends(get_db)):
    # Vérifie l'existence de l'utilisateur
    user_result = await db.execute(select(User).where(User.id == user_id))
    user = user_result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")

    # Supprime les liens de rôle
    await db.execute(delete(user_roles).where(user_roles.c.user_id == user_id))

    # Supprime l'utilisateur
    await db.delete(user)
    await db.commit()
    return {"message": "Utilisateur supprimé avec succès ✅"}


# --------------------------------------------------- #
# Endpoint : réactiver un utilisateur (super admin)   #
# --------------------------------------------------- #
@router.put("/reactivate/{user_id}")
async def reactivate_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(has_role(["super_admin"]))
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")

    user.is_active = True
    await db.commit()
    return {"message": "Utilisateur réactivé ✅"}
