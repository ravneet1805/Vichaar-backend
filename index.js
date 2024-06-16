const express = require("express");
const socketIO = require("socket.io");
const userRouter = require("./routes/userRoutes");
const noteRouter = require("./routes/noteRoutes");
const app = express();
const mongoose = require("mongoose");
const fileUpload = require('express-fileupload')

app.use(express.json())


app.use((req, res, next)=>{
    console.log("HTTP method:"+req.method+"URL:"+req.url);

    next();
})

app.use(fileUpload({
    useTempFiles: true
}))




app.use("/users", userRouter);
app.use("/notes", noteRouter);


app.get("/", (req,res)=>{
    res.status(200).send("hello ravneet")
})



mongoose.connect("mongodb+srv://ravneetsingh:QKM3et7gJV7tHLyx@cluster0.71gvnk2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
.then(()=>{
    console.log("connected to DB");
})
.catch((error)=>{
    console.log(error)
})

const server = app.listen(4000, ()=>{
    console.log("server started")
})

// const io = socketIO(server);

// // Socket.IO connection handling
// io.on("connection", (socket) => {
//     console.log("A user connected");

//     // Handle socket events, e.g., chat messages
//     socket.on("chat message", (msg) => {
//         console.log(`Message: ${msg}`);
//         io.emit("chat message", msg); // Broadcast the message to all connected clients
//     });

//     socket.on("disconnect", () => {
//         console.log("User disconnected");
//     });
// });
