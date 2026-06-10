from fastapi import FastAPI
from fastapi import WebSocket
from fastapi import WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

from database import Base
from database import engine
from database import SessionLocal

from websocket_manager import manager

from models.user import User
from models.message import Message

from routes.auth import router as auth_router
from routes.users import router as users_router
from routes.chat import router as chat_router


Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router)
app.include_router(users_router)
app.include_router(chat_router)


@app.get("/")
def home():
    return {
        "message": "Chat Backend Running"
    }


@app.websocket("/ws/{user_id}")
async def websocket_endpoint(
        websocket: WebSocket,
        user_id: int
):

    db = SessionLocal()

    await manager.connect(
        user_id,
        websocket
    )

    try:

        user = db.query(User).get(user_id)

        if user:
            user.is_online = True
            db.commit()

        await manager.broadcast(
            {
                "type": "presence",
                "user_id": user_id,
                "status": "online"
            }
        )

        while True:

            data = await websocket.receive_json()

            event_type = data.get("type")

            # ==================================
            # SEND MESSAGE
            # ==================================

            if event_type == "message":

                sender_id = data["sender_id"]

                receiver_id = data["receiver_id"]

                text = data["message"]

                msg = Message(
                    sender_id=sender_id,
                    receiver_id=receiver_id,
                    message=text,
                    status="sent"
                )

                db.add(msg)

                db.commit()

                db.refresh(msg)

                await manager.send_to_user(
                    receiver_id,
                    {
                        "type": "message",
                        "id": msg.id,
                        "sender_id": sender_id,
                        "receiver_id": receiver_id,
                        "message": text,
                        "status": "delivered"
                    }
                )

                msg.status = "delivered"

                db.commit()

                await manager.send_to_user(
                    sender_id,
                    {
                        "type": "delivered",
                        "message_id": msg.id,
                        "status": "delivered"
                    }
                )

            # ==================================
            # TYPING
            # ==================================

            elif event_type == "typing":

                receiver_id = data["receiver_id"]

                await manager.send_to_user(
                    receiver_id,
                    {
                        "type": "typing",
                        "sender_id": user_id
                    }
                )

            # ==================================
            # STOP TYPING
            # ==================================

            elif event_type == "stop_typing":

                receiver_id = data["receiver_id"]

                await manager.send_to_user(
                    receiver_id,
                    {
                        "type": "stop_typing",
                        "sender_id": user_id
                    }
                )

            # ==================================
            # READ RECEIPT
            # ==================================

            # elif event_type == "read":

            #     message_id = data["message_id"]

            #     msg = db.query(Message).get(
            #         message_id
            #     )

            elif event_type == "read":

                message_id = data["message_id"]

                msg = db.query(Message).get(
                    message_id
                )

                if msg:

                    msg.status = "read"

                    db.commit()

                    await manager.send_to_user(
                        msg.sender_id,
                        {
                            "type": "read",
                            "message_id": msg.id
                        }
                    )

                    db.delete(msg)

                    db.commit()

                if msg:

                    msg.status = "read"

                    db.commit()

                    await manager.send_to_user(
                        msg.sender_id,
                        {
                            "type": "read",
                            "message_id": msg.id,
                            "status": "read"
                        }
                    )

            # ==================================
            # GET ONLINE USERS
            # ==================================

            elif event_type == "online_users":

                online = list(
                    manager.active_connections.keys()
                )

                await manager.send_to_user(
                    user_id,
                    {
                        "type": "online_users",
                        "users": online
                    }
                )

    except WebSocketDisconnect:

        manager.disconnect(user_id)

        user = db.query(User).get(user_id)

        if user:

            user.is_online = False

            user.last_seen = datetime.utcnow()

            db.commit()

        await manager.broadcast(
            {
                "type": "presence",
                "user_id": user_id,
                "status": "offline",
                "last_seen": str(
                    datetime.utcnow()
                )
            }
        )

    finally:

        db.close()