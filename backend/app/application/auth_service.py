import os
from datetime import datetime, timedelta
from passlib.hash import sha256_crypt
import jwt
from sqlalchemy.orm import Session
from app.infrastructure.db_models import UserDB
from app.domain.models import UserCreate, User

SECRET_KEY = os.getenv("JWT_SECRET", "super-secret-key-123")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 # 1 day

class AuthService:
    def __init__(self, db: Session):
        self.db = db

    def get_user_by_email(self, email: str):
        return self.db.query(UserDB).filter(UserDB.email == email).first()

    def create_user(self, user_in: UserCreate):
        hashed_password = sha256_crypt.hash(user_in.password)
        db_user = UserDB(
            email=user_in.email,
            name=user_in.name,
            role=user_in.role.value,
            hashed_password=hashed_password,
            phone=user_in.phone
        )
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        return User.model_validate(db_user)

    def verify_password(self, plain_password, hashed_password):
        return sha256_crypt.verify(plain_password, hashed_password)

    def authenticate_user(self, email: str, password: str):
        user = self.get_user_by_email(email)
        if not user:
            return False
        if not self.verify_password(password, user.hashed_password):
            return False
        return user

    def create_access_token(self, data: dict):
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
