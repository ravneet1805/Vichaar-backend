const nodemailer = require('nodemailer');
const { getMaxListeners } = require('../models/otp');

const mailSender = async (email, title, body) => {
    try {
        // Create a Transporter to send emails
        let transporter = nodemailer.createTransport({
            service : "gmail", 
            port: 465,
            auth: {
                user: "codecrew061@gmail.com",
                pass: "bjrspavoyuttyozv",
            }
        });
        // Send emails to users
        let info = await transporter.sendMail({
            from: 'codecrew061@gmail.com Vichaar',
            to: email,
            subject: title,
            html: body,
        });
        console.log("Email info: ", info);
        return info;
    } catch (error) {
        console.log(error.message);
    }
};
module.exports = mailSender;