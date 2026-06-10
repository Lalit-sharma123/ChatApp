function ChatHeader({
 selectedUser
}){

 if(!selectedUser)
  return null

 return(

  <div className="chat-header">

   <div>

    <h3>
      {selectedUser.username}
    </h3>

    <small>
      Online
    </small>

   </div>

  </div>

 )
}

export default ChatHeader