const express = require("express");
const { signup, signin, searchUsers, getUser, followUser, unfollowUser, linkedinAuth,linkedinCallback,profile } = require("../controllers/userControllers");

const auth = require('../middleware/auth')
const userRouter = express.Router();

userRouter.post("/signup", signup)

userRouter.post("/signin", signin)

userRouter.get("/search/:key", searchUsers)

userRouter.get("/userdata/:id", getUser)

userRouter.post("/follow/:id",auth, followUser)

userRouter.post("/unfollow/:id", auth, unfollowUser)


module.exports = userRouter;