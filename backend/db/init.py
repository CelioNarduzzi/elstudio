import asyncio
from db.database import engine, SessionLocal
from db.models import Base, User
from core.auth import hash_password

async def init():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with SessionLocal() as session:
        user = User(
            email="admin@admin.com",
            hashed_password=hash_password("admin123")
        )
        session.add(user)
        await session.commit()
        print("✔ Utilisateur admin créé")

if __name__ == "__main__":
    asyncio.run(init())
