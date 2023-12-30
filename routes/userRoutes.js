const express = require("express");
const { signup, signin, searchUsers, getUser } = require("../controllers/userControllers");
const userRouter = express.Router();

userRouter.post("/signup", signup)

userRouter.post("/signin", signin)

userRouter.get("/search/:key", searchUsers)

userRouter.get("/userdata/:id", getUser)

module.exports = userRouter;