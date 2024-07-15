const express = require('express');
const otpController = require('../controllers/otpController');
const otpRouter = express.Router();
otpRouter.post('/send-otp', otpController.sendOTP);
module.exports = otpRouter;