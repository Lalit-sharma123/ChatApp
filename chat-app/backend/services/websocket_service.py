from websocket_manager import manager


async def send_message_to_user(
        receiver_id,
        payload
):
    await manager.send_to_user(
        receiver_id,
        payload
    )