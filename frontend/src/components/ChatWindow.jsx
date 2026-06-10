import MessageBubble from "./MessageBubble";

function ChatWindow({
  messages,
  currentUser
}) {

  return (

    <div
      style={{
        height: "400px",
        overflowY: "auto",
        border: "1px solid #ddd",
        padding: "10px"
      }}
    >

      {messages.map((msg) => (

        <MessageBubble
          key={msg.id}
          message={msg}
          currentUser={currentUser}
        />

      ))}

    </div>
  );
}

export default ChatWindow;