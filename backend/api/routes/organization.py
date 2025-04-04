from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from backend.db.database import get_db
from backend.db.models import Organization, User
from backend.core.dependencies import get_current_user
from pydantic import BaseModel
from typing import Optional

# Création du routeur pour les endpoints liés à l'organisation
router = APIRouter()

# Schéma de données pour la mise à jour d'une organisation (tous les champs sont optionnels)
class OrganizationUpdate(BaseModel):
    name: Optional[str] = None
    smtp_host: Optional[str] = None
    smtp_port: Optional[int] = None
    smtp_user: Optional[str] = None
    smtp_password: Optional[str] = None
    smtp_use_tls: Optional[bool] = None
    smtp_use_ssl: Optional[bool] = None
    default_from_email: Optional[str] = None
    logo_url: Optional[str] = None

# Endpoint pour récupérer les informations de l'organisation
@router.get("/organization")
async def get_organization(db: AsyncSession = Depends(get_db)):
    """
    Récupère les informations de l'organisation.
    Limité à la première organisation trouvée (dans le cas d'une seule organisation dans la base).
    """
    result = await db.execute(select(Organization).limit(1))
    org = result.scalar_one_or_none()

    if not org:
        raise HTTPException(status_code=404, detail="Organisation non trouvée")

    return org

# Endpoint pour mettre à jour les informations de l'organisation
@router.put("/organization")
async def update_organization(
    data: OrganizationUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """
    Met à jour les informations de l'organisation.
    Seuls les utilisateurs avec le rôle 'super_admin' peuvent accéder à cette route.
    """
    # Vérifie que l'utilisateur connecté a le rôle 'super_admin'
    if "super_admin" not in [role.name for role in user.roles]:
        raise HTTPException(status_code=403, detail="Accès interdit : rôle super_admin requis")

    # Récupère l'organisation (en supposant qu'il n'y en a qu'une seule)
    result = await db.execute(select(Organization).limit(1))
    org = result.scalar_one_or_none()

    if not org:
        raise HTTPException(status_code=404, detail="Organisation non trouvée")

    # Met à jour uniquement les champs fournis dans la requête
    for field, value in data.dict(exclude_unset=True).items():
        setattr(org, field, value)

    # Enregistre les modifications dans la base de données
    await db.commit()
    await db.refresh(org)

    return org
