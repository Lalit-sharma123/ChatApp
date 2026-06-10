from fastapi import WebSocket


class ConnectionManager:

    def __init__(self):
        self.active_connections = {}

    async def connect(
        self,
        user_id: int,
        websocket: WebSocket
    ):
        await websocket.accept()

        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: int):

        if user_id in self.active_connections:
            del self.active_connections[user_id]

    def is_online(self, user_id: int):

        return user_id in self.active_connections

    async def send_to_user(
        self,
        user_id: int,
        payload: dict
    ):

        websocket = self.active_connections.get(
            user_id
        )

        if websocket:
            await websocket.send_json(payload)

    async def broadcast(
        self,
        payload: dict
    ):

        for ws in self.active_connections.values():

            await ws.send_json(payload)


manager = ConnectionManager()