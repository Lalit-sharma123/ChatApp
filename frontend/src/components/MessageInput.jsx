function MessageInput({
 message,
 setMessage,
 sendMessage
}){

 return(

  <div className="chat-input">

   <input
    value={message}
    onChange={(e)=>
      setMessage(
       e.target.value
      )
    }
   />

   <button
    onClick={sendMessage}
   >
    Send
   </button>

  </div>

 )
}

export default MessageInput