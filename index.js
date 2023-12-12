const express = require("express");
const userRouter = require("./routes/userRoutes");
const app = express();
const mongoose = require("mongoose");

app.use(express.json())

app.use("/users", userRouter);

app.get("/", (req,res)=>{
    res.status(200).send("hello ravneet")
})

mongoose.connect("mongodb+srv://ravneetsingh:tdFsLYGdSzAvlCQW@cluster0.71gvnk2.mongodb.net/?retryWrites=true&w=majority")
.then(()=>{
    console.log("connected to DB");
})
.catch((error)=>{
    console.log(error)
})

app.listen(4000, ()=>{
    console.log("server started")
})