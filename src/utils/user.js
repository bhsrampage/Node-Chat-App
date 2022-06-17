const users = [];

// addUser , removeUser , getUser , getUsersInRoom

const addUser = ({ id, username, room }) => {
  //cleandata
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  //ValidateData
  if (!username || !room) {
    return {
      error: "Username and Room are required",
    };
  }

  // Check for existing user
  const existing = users.find((u) => {
    return u.room === room && u.username === username;
  });

  //Validate username
  if (existing) {
    return {
      error: "Username is in use!",
    };
  }

  //Store User
  const user = { id, username, room };
  users.push(user);
  return { user };
};

const removeUser = (id) => {
  const index = users.findIndex((u) => u.id === id);

  if (index != -1) {
    return users.splice(index, 1)[0];
  }
};

const getUser = (id) => {
  return users.find((u) => u.id === id);
};

const getUsersInRoom = (room) => {
  return users.filter((u) => u.room === room);
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
};
