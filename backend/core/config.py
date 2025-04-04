import os

SECRET_KEY = os.getenv("SECRET_KEY", "super-secret-key")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = 60  # ou ce que tu veux

# Durée spécifique pour les tokens de réinitialisation (si différente)
RESET_TOKEN_EXPIRE_MINUTES = 15