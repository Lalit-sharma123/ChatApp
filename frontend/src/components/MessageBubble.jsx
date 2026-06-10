function MessageBubble({
 message,
 currentUser
}){

 const mine=
  message.sender_id===currentUser

 return(

  <div
   className={
    mine
    ? "message mine"
    : "message other"
   }
  >

   <div>
    {message.message}
   </div>

   <div className="status">

    {
      message.status==="sent"
      && "✓"
    }

    {
      message.status==="delivered"
      && "✓✓"
    }

    {
      message.status==="read"
      && "✓✓ Read"
    }

   </div>

  </div>

 )
}

export default MessageBubble