from fastapi import Depends, HTTPException, status
from backend.core.auth import get_current_user
from backend.db.models import User

def has_role(required_roles: list[str]):
    async def checker(current_user: User = Depends(get_current_user)):
        user_roles = [role.name for role in current_user.roles]
        if not any(role in user_roles for role in required_roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Vous n'avez pas les autorisations requises"
            )
        return current_user
    return checker