from sqlalchemy import Column
from sqlalchemy import Integer,Boolean
from sqlalchemy import String
from sqlalchemy import DateTime
from sqlalchemy import ForeignKey

from datetime import datetime

from database import Base


class Message(Base):

    __tablename__ = "messages"

    id = Column(Integer, primary_key=True)

    sender_id = Column(
        Integer,
        ForeignKey("users.id")
    )

    receiver_id = Column(
        Integer,
        ForeignKey("users.id")
    )

    message = Column(String)

    status = Column(
        String,
        default="sent"
    )



    is_deleted = Column(
        Boolean,
        default=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )