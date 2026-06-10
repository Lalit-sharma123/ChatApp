function UserList({
  users,
  selectUser
}) {

  return (
    <div
      style={{
        width: "250px",
        borderRight: "1px solid #ddd"
      }}
    >

      <h3>Users</h3>

      {users.map((user) => (

        <div
          key={user.id}
          onClick={() => selectUser(user)}
          style={{
            cursor: "pointer",
            padding: "10px"
          }}
        >
          {user.username}

          {user.is_online &&
            <span> 🟢 </span>
          }

        </div>

      ))}

    </div>
  );
}

export default UserList;