function Sidebar({
 users,
 selectUser
}){

 return(

  <div className="sidebar">

   <div className="profile">
     My Profile
   </div>

   <div className="search">
     <input
      placeholder="Search"
     />
   </div>

   {
    users.map(user=>(

      <div
       key={user.id}
       className="user"
       onClick={()=>
         selectUser(user)
       }
      >

       {user.username}

       {
        user.is_online
        &&
        " 🟢"
       }

      </div>

    ))
   }

  </div>

 )
}

export default Sidebar