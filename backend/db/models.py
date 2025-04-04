from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, Date,
    Table, ForeignKey
)
from sqlalchemy.orm import relationship, declarative_base
from datetime import datetime

Base = declarative_base()

# ================================
# 🔗 TABLE D'ASSOCIATION UTILISATEUR <-> RÔLE
# ================================

user_roles = Table(
    "user_roles",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id", ondelete="CASCADE")),
    Column("role_id", Integer, ForeignKey("roles.id", ondelete="CASCADE")),
)

# ================================
# 📦 MODÈLE DE RÔLE
# ================================

class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, nullable=False)

    users = relationship("User", secondary=user_roles, back_populates="roles")

# ================================
# 👤 MODÈLE D'UTILISATEUR
# ================================

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    birth_date = Column(Date, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    
    is_active = Column(Boolean, default=True)
    must_change_password = Column(Boolean, default=True)

    language = Column(String, default="fr")
    date_format = Column(String, default="DD/MM/YYYY")
    theme = Column(String, default="light")

    roles = relationship("Role", secondary=user_roles, back_populates="users")

# ================================
# 🏢 MODÈLE ORGANIZATION
# ================================

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    logo_url = Column(String, nullable=True)

    smtp_host = Column(String, nullable=True)
    smtp_port = Column(Integer, nullable=True)
    smtp_user = Column(String, nullable=True)
    smtp_password = Column(String, nullable=True)
    smtp_use_tls = Column(Boolean, default=False)
    smtp_use_ssl = Column(Boolean, default=False)
    default_from_email = Column(String, nullable=True)
