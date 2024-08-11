const express = require("express");

const {getNotification} = require("../controllers/notificationController")
const auth = require('../middleware/auth')
const notificationRouter = express.Router();

notificationRouter.get("/", auth, getNotification)

module.exports = notificationRouter


