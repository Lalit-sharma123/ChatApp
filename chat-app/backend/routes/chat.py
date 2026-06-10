from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from sqlalchemy.orm import Session

from database import get_db

from models.message import Message

from schemas.message import MessageCreate

router = APIRouter(
    prefix="/chat",
    tags=["Chat"]
)


@router.post("/send")
def send_message(
        payload: MessageCreate,
        db: Session = Depends(get_db)
):

    msg = Message(
        sender_id=payload.sender_id,
        receiver_id=payload.receiver_id,
        message=payload.message,
        status="sent"
    )

    db.add(msg)

    db.commit()

    db.refresh(msg)

    return msg


@router.get("/{user1}/{user2}")
def get_messages(
        user1: int,
        user2: int,
        db: Session = Depends(get_db)
):

    return db.query(Message).filter(

            Message.is_deleted == False,

            (
                (
                    (Message.sender_id == user1) &
                    (Message.receiver_id == user2)
                )
                |
                (
                    (Message.sender_id == user2) &
                    (Message.receiver_id == user1)
                )
            )

        ).all()




@router.put(
    "/delivered/{message_id}"
)
def delivered(
        message_id: int,
        db: Session = Depends(get_db)
):

    msg = db.query(Message).get(
        message_id
    )

    msg.status = "delivered"

    db.commit()

    return {
        "status": "updated"
    }



@router.put(
    "/read/{message_id}"
)
def read_message(
        message_id: int,
        db: Session = Depends(get_db)
):

    msg = db.query(Message).get(
        message_id
    )

    msg.status = "read"

    db.commit()

    return {
        "status": "read"
    }



@router.delete(
    "/delete/{message_id}"
)
def delete_message(
    message_id: int,
    db: Session = Depends(get_db)
):

    message = db.query(
        Message
    ).filter(
        Message.id == message_id
    ).first()

    if not message:
        raise HTTPException(
            status_code=404,
            detail="Message not found"
        )

    message.is_deleted = True

    db.commit()

    return {
        "message":
        "Deleted"
    }