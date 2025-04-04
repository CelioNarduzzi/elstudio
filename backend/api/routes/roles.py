from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from backend.db.database import get_db
from backend.db.models import Role

# Routeur dédié à la gestion des rôles utilisateurs
router = APIRouter(prefix="/roles")

# Endpoint pour récupérer la liste de tous les rôles disponibles
@router.get("/")
async def get_roles(db: AsyncSession = Depends(get_db)):
    """
    Retourne tous les rôles existants dans la base de données.
    Chaque rôle est renvoyé sous forme de dictionnaire contenant son ID et son nom.
    """
    # Exécution de la requête pour récupérer tous les rôles
    result = await db.execute(select(Role))

    # Transformation des résultats en liste d'objets Role
    roles = result.scalars().all()

    # Formatage de la réponse : ID et nom de chaque rôle
    return [{"id": r.id, "name": r.name} for r in roles]
