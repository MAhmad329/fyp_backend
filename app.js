var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var http = require('http');
require("dotenv").config();



const mongoose = require("mongoose");
var cors = require("cors");

//Step2 Write all the routers here
// var indexRouter = require("./routes/index");
// var usersRouter = require("./routes/users");
// var postRouter = require("./routes/post");
// var userRouter = require("./routes/user");
var projectRouter = require("./routes/project");
var companyRouter = require("./routes/company");
var firebaseRouter = require("./routes/firebase");
var freelancerRouter = require("./routes/freelancer");
var chatRouter = require("./routes/chat");
const  Team  = require("./models/team")

var app = express();
var server = http.createServer(app); // Create an HTTP server
var io = require('socket.io')(server, {
  cors: {
    origin: 'http://localhost:3001',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});// Set up Socket.IO

app.set('io', io);


app.set('io', io);

const activeUsers = new Map();

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('user online', ({ userId }) => {
        activeUsers.set(userId, socket.id);
        socket.userId = userId;
    });

    // When sending a message from the server, add a timestamp
socket.on('individual chat message', async ({ sender, receiverId, content }) => {
  const receiverSocketId = activeUsers.get(receiverId);
  if (receiverSocketId && receiverSocketId !== socket.id) {
    const timestamp = new Date(); // Get current time
    const isRead = false;
    io.to(receiverSocketId).emit('individual chat message', { sender, content, timestamp,isRead });
  }
});


// socket.on('team chat message', async ({ teamId, senderId, content }) => {
//     const team = await Team.findById(teamId);
//     if (team) {
//         team.members.forEach(memberId => {
//             const memberSocketId = activeUsers.get(memberId.toString());
//             if (memberSocketId) {
//                 io.to(memberSocketId).emit('team chat message', { senderId, content });
//             }
//         });
//         const senderSocketId = activeUsers.get(senderId); // Get the sender's socket ID
//         if (senderSocketId) {
//             io.to(senderSocketId).emit('team chat message', { senderId, content }); // Emit back to the sender
//         }
//     }
// });
  

socket.on('team chat message', ({ teamId, sender, senderUsername, content }) => {
        const timestamp = new Date();
        const isRead = false;
        io.to(teamId).emit('team chat message', { sender, senderUsername, content, timestamp, isRead });
    });

    socket.on('join team chat', ({ teamId }) => {
        socket.join(teamId);
        console.log(`User ${socket.userId} joined team chat ${teamId}`);
    });

    socket.on('disconnect', () => {
        activeUsers.delete(socket.userId);
        console.log('User disconnected');
    });
});



// Make Connection with the database

//  const connection = mongoose.connect(
//    "mongodb+srv://outsourcepro:outsourcepro@cluster0.p5nmxic.mongodb.net/?retryWrites=true&w=majority"
//  );

const connection = mongoose.connect(
     "mongodb+srv://azanahmad666:azanahmad666@cluster0.nqsuuu2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
   );

console.log("Connecting..");

connection.then(
  (db) => {
    console.log("Connected Successfully");
  },
  (error) => {
    console.log("Error in connectivity");
    console.log(error);
  }
);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(cors({ credentials:true, origin: "http://localhost:3001" }));

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Credentials', true);
  // other headers...
  next();
});
// Step 3  Using Routes
// app.use("/", indexRouter);
// app.use("/users", usersRouter);
// app.use("/api/v1", postRouter);
// app.use("/api/v1", userRouter);

app.use("/api/v1", projectRouter);
app.use("/api/v1", companyRouter);
app.use("/api/v1", firebaseRouter);
app.use("/api/v1", freelancerRouter);
app.use("/api/v1", chatRouter);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = { app, server, io };