from pydantic import BaseModel


class MessageCreate(BaseModel):

    sender_id: int

    receiver_id: int

    message: str


class MessageResponse(BaseModel):

    id: int

    sender_id: int

    receiver_id: int

    message: str

    status: str

    class Config:
        from_attributes = True