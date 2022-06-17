const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const Filter = require("bad-words");
const { generateMessage } = require("./utils/messages");
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./utils/user");

const app = express();

const server = http.createServer(app);
const io = socketio(server);

//Servig up public directory
const publicDir = path.join(__dirname, "../public");
app.use(express.static(publicDir));

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.render("index");
});

io.on("connection", (socket) => {
  console.log("New socket connection");

  socket.on("outMsg", (val, callback) => {
    var filter = new Filter();
    const user = getUser(socket.id);
    if (filter.isProfane(val)) {
      return callback("Profanity is not allowed!!!");
    }

    io.to(user.room).emit("inMsg", generateMessage(val, user.username)); //everyone
    callback("Delivered"); //used for running the function passed in the third argument of emit
  });

  socket.on("sendLocation", (msg, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit(
      "recLoc",
      generateMessage(
        `https://www.google.com/maps?q=${msg.lat},${msg.long}`,
        user.username
      )
    );

    callback("Shared!!");
  });

  socket.on("join", (options, callback) => {
    const { error, user } = addUser({ id: socket.id, ...options });

    if (error) {
      return callback(error);
    }

    socket.join(user.room);
    socket.emit(
      "message",
      generateMessage(`Welcome to Chat-Room "${user.room}"`, "Admin")
    ); //only sender
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        generateMessage(`${user.username} has joined the chat`, "Admin")
      ); //everyone other that sender

    const usersList = getUsersInRoom(user.room);
    io.to(user.room).emit("roomdata", { name: user.room, usersList });
    callback();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.emit(
        "message",
        generateMessage(`${user.username} has left ${user.room}!`, "Admin")
      );

      const usersList = getUsersInRoom(user.room);
      io.to(user.room).emit("roomdata", { name: user.room, usersList });
    }
  });
});

//Starting the server
server.listen(PORT, () => {
  console.log(`Server active on port ${PORT}`);
});
