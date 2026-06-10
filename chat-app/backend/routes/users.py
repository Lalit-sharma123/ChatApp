from fastapi import APIRouter
from fastapi import Depends

from sqlalchemy.orm import Session

from database import get_db

from models.user import User

from fastapi import UploadFile
from fastapi import File


router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


@router.get("/")
def get_users(
        db: Session = Depends(get_db)
):
    return db.query(User).all()



@router.post("/upload/{user_id}")
async def upload_profile(
    user_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):

    filename = f"uploads/{file.filename}"

    with open(
        filename,
        "wb"
    ) as f:
        f.write(
            await file.read()
        )

    user = db.query(User).get(user_id)

    user.profile_photo = filename

    db.commit()

    return {
        "photo": filename
    }