const otpGenerator = require('otp-generator');
const OTP = require('../models/otp');
const User = require('../models/user');
const bcrypt = require('bcrypt')

exports.sendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        // Check if user is already present
        const checkUserPresent = await User.findOne({ email });
        // If user found with provided email
        if (checkUserPresent) {
            return res.status(401).json({
                success: false,
                message: 'User is already registered',
            });
        }
        let otp = otpGenerator.generate(4, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });
        let result = await OTP.findOne({ otp: otp });
        while (result) {
            otp = otpGenerator.generate(4, {
                upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
            });
            result = await OTP.findOne({ otp: otp });
        }
        const otpPayload = { email, otp };
        const otpBody = await OTP.create(otpPayload);
        res.status(200).json({
            success: true,
            message: 'OTP sent successfully',
            otp,
        });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ success: false, error: error.message });
    }
};

exports.sendPasswordResetOTP = async (req, res) => {
    try {
        const { email } = req.body;
        // Check if user is already present
        const checkUserPresent = await User.findOne({ email });
        // If user found with provided email
        if (!checkUserPresent) {
            return res.status(401).json({
                success: false,
                message: 'User not registered',
            });
        }
        let otp = otpGenerator.generate(4, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });
        let result = await OTP.findOne({ otp: otp });
        while (result) {
            otp = otpGenerator.generate(4, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false
            });
            result = await OTP.findOne({ otp: otp });
        }
        const otpPayload = { email, otp };
        const otpBody = await OTP.create(otpPayload);
        res.status(200).json({
            success: true,
            message: 'OTP sent successfully',
            otp,
        });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ success: false, error: error.message });
    }
};


exports.verifyOTPAndResetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    try {
        // Find the user by email

        if (newPassword.length <6) {

            return res.status(404).json({message: 'Password should be minimum 6 characters'})
            
        }
        const user = await User.findOne({ email });
        console.log(user.password)

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find the OTP record
        const otpRecord = await OTP.findOne({ email, otp });

        if (!otpRecord) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }
        console.log("password: "+ newPassword)

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        //console.log("hashed password: "+hashedPassword)


        // Update the user's password
        user.password = hashedPassword;
        console.log(user)
        await user.save();

        // Clear OTP after successful reset
        await OTP.deleteOne({ email, otp });

        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ success: false, error: error.message });
    }
};