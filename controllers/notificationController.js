const { app } = require("firebase-admin");
const userModel = require("../models/user");

const getNotification = async (req, res) => {
    try {
        const id = req.userId;
        const user = await userModel.findById(id);
        res.json(user.notifications);
    } catch (err) {
        res.status(500).send(err);
    }
};

module.exports = {getNotification}