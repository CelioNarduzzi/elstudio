from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from backend.db.database import get_db
from backend.db.models import Role
from pydantic import BaseModel


# Routeur dédié à la gestion des rôles utilisateurs
router = APIRouter(prefix="/roles")

class RoleBase(BaseModel):
    name: str

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

@router.post("/")
async def create_role(role: RoleBase, db: AsyncSession = Depends(get_db)):
    new_role = Role(name=role.name)
    db.add(new_role)
    await db.commit()
    return {"message": "Rôle ajouté ✅"}

@router.put("/{role_id}")
async def update_role(role_id: int, updated: RoleBase, db: AsyncSession = Depends(get_db)):
    role = await db.get(Role, role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Rôle non trouvé")

    role.name = updated.name
    await db.commit()
    return {"message": "Rôle mis à jour ✅"}

@router.delete("/{role_id}")
async def delete_role(role_id: int, db: AsyncSession = Depends(get_db)):
    role = await db.get(Role, role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Rôle non trouvé")

    await db.delete(role)
    await db.commit()
    return {"message": "Rôle supprimé ✅"}

