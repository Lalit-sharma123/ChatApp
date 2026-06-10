// import {
//   useEffect,
//   useState
// } from "react";

// import api from "../services/api";

// import {
//   connectSocket
// } from "../services/socket";

// import UserList from "../components/UserList";

// import ChatWindow from "../components/ChatWindow";

// import TypingIndicator from "../components/TypingIndicator";

// function Chat() {

//   const currentUser = 1;

//   const [users, setUsers] = useState([]);

//   const [selectedUser,
//     setSelectedUser] = useState(null);

//   const [messages,
//     setMessages] = useState([]);

//   const [message,
//     setMessage] = useState("");

//   const [typing,
//     setTyping] = useState(false);

//   const [socket,
//     setSocket] = useState(null);

//   useEffect(() => {

//     loadUsers();

//     const ws =
//       connectSocket(currentUser);

//     ws.onmessage = (event) => {

//       const data =
//         JSON.parse(event.data);

//       if (
//         data.type === "message"
//       ) {

//         setMessages(prev => [
//           ...prev,
//           data
//         ]);
//       }

//       if (
//         data.type === "typing"
//       ) {

//         setTyping(true);

//         setTimeout(() => {
//           setTyping(false);
//         }, 2000);
//       }

//     };

//     setSocket(ws);

//   }, []);

//   const loadUsers =
//     async () => {

//       const res =
//         await api.get("/users/");

//       setUsers(
//         res.data
//       );
//     };

//   const sendMessage =
//     () => {

//       if (
//         !selectedUser
//       ) return;

//       socket.send(
//         JSON.stringify({

//           type: "message",

//           sender_id:
//             currentUser,

//           receiver_id:
//             selectedUser.id,

//           message

//         })
//       );

//       setMessages(prev => [
//         ...prev,
//         {
//           id: Date.now(),
//           sender_id: currentUser,
//           receiver_id:
//             selectedUser.id,
//           message,
//           status: "sent"
//         }
//       ]);

//       setMessage("");
//     };

//   const typingEvent =
//     () => {

//       if (
//         !selectedUser
//       ) return;

//       socket.send(
//         JSON.stringify({

//           type: "typing",

//           receiver_id:
//             selectedUser.id

//         })
//       );
//     };

//   return (

//     <div
//       style={{
//         display: "flex",
//         gap: "20px"
//       }}
//     >

//       <UserList
//         users={users}
//         selectUser={
//           setSelectedUser
//         }
//       />

//       <div
//         style={{
//           flex: 1
//         }}
//       >

//         <h2>

//           {selectedUser
//             ? selectedUser.username
//             : "Select User"}

//         </h2>

//         <ChatWindow
//           messages={messages}
//           currentUser={
//             currentUser
//           }
//         />

//         <TypingIndicator
//           typing={typing}
//         />

//         <input
//           value={message}
//           onChange={(e) => {

//             setMessage(
//               e.target.value
//             );

//             typingEvent();

//           }}
//         />

//         <button
//           onClick={
//             sendMessage
//           }
//         >
//           Send
//         </button>

//       </div>

//     </div>

//   );
// }

// export default Chat;




import { useEffect, useState } from "react";
import api from "../services/api";
import { connectSocket } from "../services/socket";

function Chat() {

  const currentUser = Number(
    localStorage.getItem("user_id")
  );

  const currentUsername =
    localStorage.getItem("username");

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {


    loadUsers();

    const ws = connectSocket(currentUser);

    ws.onmessage = (event) => {

      const data = JSON.parse(event.data);

      if (data.type === "message") {

        if (
          selectedUser &&
          (
            data.sender_id === selectedUser.id ||
            data.receiver_id === selectedUser.id
          )
        ) {

          setMessages(prev => [
            ...prev,
            data
          ]);

        }
      }
    };

    setSocket(ws);

    return () => ws.close();


  }, []);

  const loadUsers = async () => {


    const res = await api.get("/users/");

    const filtered =
      res.data.filter(
        u => u.id !== currentUser
      );

    setUsers(filtered);


  };


const loadMessages = async (userId) => {

  const res = await api.get(
    `/chat/${currentUser}/${userId}`
  );

  setMessages(res.data);

  if (socket) {

    res.data.forEach(msg => {

      if (
        msg.receiver_id === currentUser &&
        msg.status !== "read"
      ) {

        socket.send(
          JSON.stringify({
            type: "read",
            message_id: msg.id
          })
        );

      }

    });

  }

};



  const sendMessage = () => {

    if (!message.trim()) return;

    if (!selectedUser) return;

    socket.send(
      JSON.stringify({
        type: "message",
        sender_id: currentUser,
        receiver_id: selectedUser.id,
        message
      })
    );

    setMessages(prev => [
      ...prev,
      {
        id: Date.now(),
        sender_id: currentUser,
        receiver_id: selectedUser.id,
        message,
        status: "sent"
      }
    ]);

    setMessage("");


  };

  const deleteMessage =
    async (messageId) => {

      try {

        await api.delete(
          `/chat/delete/${messageId}`
        );

        setMessages(
          prev =>
            prev.filter(
              msg =>
                msg.id !== messageId
            )
        );

      } catch (err) {

        console.error(err);

      }

    };

  return (


    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "#f0f2f5"
      }}
    >

      <div
        style={{
          width: "320px",
          background: "#fff",
          borderRight: "1px solid #ddd"
        }}
      >

        <div
          style={{
            padding: "15px",
            background: "#128C7E",
            color: "#fff",
            fontWeight: "bold"
          }}
        >
          {currentUsername}
        </div>

        <input
          placeholder="Search..."
          style={{
            width: "90%",
            margin: "10px",
            padding: "10px"
          }}
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        {
          users
            .filter(user =>
              user.username
                .toLowerCase()
                .includes(
                  search.toLowerCase()
                )
            )
            .map(user => (

              <div
                key={user.id}
                onClick={() => {

                  setSelectedUser(user);

                  loadMessages(user.id);

                }}
                style={{
                  padding: "15px",
                  cursor: "pointer",
                  borderBottom:
                    "1px solid #eee"
                }}
              >
                {user.username}
              </div>

            ))
        }

      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column"
        }}
      >

        <div
          style={{
            height: "70px",
            background: "#fff",
            borderBottom:
              "1px solid #ddd",
            display: "flex",
            alignItems: "center",
            paddingLeft: "20px"
          }}
        >
          {
            selectedUser
              ? selectedUser.username
              : "Select User"
          }
        </div>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px",
            background: "#efeae2"
          }}
        >

          {messages.map(msg => (

            <div
              key={msg.id}
              style={{
                display: "flex",
                justifyContent:
                  msg.sender_id === currentUser
                    ? "flex-end"
                    : "flex-start",
                marginBottom: "10px"
              }}
            >

              <div
                style={{
                  background:
                    msg.sender_id === currentUser
                      ? "#d9fdd3"
                      : "#fff",
                  padding: "10px",
                  borderRadius: "10px",
                  maxWidth: "300px"
                }}
              >
                <div>

                  {msg.message}

                  {
                    msg.sender_id === currentUser &&
                    (
                      <button
                        onClick={() =>
                          deleteMessage(
                            msg.id
                          )
                        }
                        style={{
                          marginLeft: "10px",
                          color: "red",
                          border: "none",
                          cursor: "pointer"
                        }}
                      >
                        🗑
                      </button>
                    )
                  }

                </div>

                <small>
                  {msg.status === "sent" && "✓"}
                  {msg.status === "delivered" && "✓✓"}
                  {msg.status === "read" && "✓✓ Read"}
                </small>

              </div>

            </div>

          ))}

        </div>

        <div
          style={{
            display: "flex",
            padding: "10px",
            background: "#fff"
          }}
        >

          <input
            value={message}
            onChange={(e) =>
              setMessage(e.target.value)
            }
            style={{
              flex: 1,
              padding: "10px"
            }}
          />

          <button
            onClick={sendMessage}
            style={{
              marginLeft: "10px",
              padding: "10px 20px",
              background: "#128C7E",
              color: "#fff",
              border: "none"
            }}
          >
            Send
          </button>

        </div>

      </div>

    </div>


  );
}

export default Chat;
