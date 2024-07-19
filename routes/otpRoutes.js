const express = require('express');
const otpController = require('../controllers/otpController');
const otpRouter = express.Router();
otpRouter.post('/send-otp', otpController.sendOTP);
otpRouter.post('/passwordreset-otp', otpController.sendPasswordResetOTP);
otpRouter.post('/passwordreset', otpController.verifyOTPAndResetPassword);
module.exports = otpRouter;