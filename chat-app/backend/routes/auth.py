from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

from database import get_db

from models.user import User

from schemas.user import UserCreate

from schemas.auth import LoginSchema

from services.auth_service import (
    hash_password,
    verify_password,
    create_access_token
)

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post("/register")
def register(
        user: UserCreate,
        db: Session = Depends(get_db)
):

    existing = db.query(User).filter(
        User.email == user.email
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    db_user = User(
        username=user.username,
        email=user.email,
        password=hash_password(
            user.password
        )
    )

    db.add(db_user)

    db.commit()

    db.refresh(db_user)

    return db_user


# @router.post("/login")
# def login(
#         credentials: LoginSchema,
#         db: Session = Depends(get_db)
# ):

#     user = db.query(User).filter(
#         User.email == credentials.email
#     ).first()

#     if not user:
#         raise HTTPException(
#             status_code=401,
#             detail="Invalid credentials"
#         )

#     if not verify_password(
#             credentials.password,
#             user.password
#     ):
#         raise HTTPException(
#             status_code=401,
#             detail="Invalid credentials"
#         )

#     token = create_access_token(
#         {"sub": str(user.id)}
#     )

#     return {
#         "access_token": token,
#         "token_type": "bearer"
#     }


@router.post("/login")
def login(
        credentials: LoginSchema,
        db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.email == credentials.email
    ).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

    if not verify_password(
            credentials.password,
            user.password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

    token = create_access_token(
        {"sub": str(user.id)}
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "is_online": user.is_online,
            "profile_photo": user.profile_photo
        }
    }