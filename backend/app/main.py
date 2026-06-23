from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.infrastructure.database import engine, Base
from app.infrastructure import db_models

from app.presentation.routers import router as terms_router

# Create database tables (for dev, later use Alembic)
Base.metadata.create_all(bind=engine)

# Inject Default Admin and Data
from app.infrastructure.database import SessionLocal
from app.infrastructure.db_models import UserDB, TermDB, UnitDB, ClassGroupDB
from passlib.hash import sha256_crypt
from datetime import date

db = SessionLocal()
if not db.query(UserDB).filter(UserDB.email == "admin@teachgen.com").first():
    admin = UserDB(
        email="admin@teachgen.com", 
        name="Admin General", 
        role="ADMIN", 
        hashed_password=sha256_crypt.hash("admin123"),
        phone="+591 70000000"
    )
    db.add(admin)
    db.commit()
db.close()


app = FastAPI(
    title="Teach-Gen API",
    description="API for Educational Management System (Clean Architecture)",
    version="1.0.0"
)

app.include_router(terms_router)

# CORS configuration for Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development. In production, change to specific domains.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to Teach-Gen API"}
