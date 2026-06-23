from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import jwt
from sqlalchemy.orm import Session
from app.infrastructure.database import get_db
from app.application.auth_service import SECRET_KEY, ALGORITHM
from app.infrastructure.db_models import UserDB
from app.domain.models import Role

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
        
    user = db.query(UserDB).filter(UserDB.email == email).first()
    if user is None:
        raise credentials_exception
    return user

def get_current_admin(current_user: UserDB = Depends(get_current_user)):
    if current_user.role != Role.ADMIN.value:
        raise HTTPException(status_code=403, detail="Not enough privileges")
    return current_user

def get_current_professor(current_user: UserDB = Depends(get_current_user)):
    if current_user.role != Role.PROFESSOR.value and current_user.role != Role.ADMIN.value:
        raise HTTPException(status_code=403, detail="Not enough privileges")
    return current_user
