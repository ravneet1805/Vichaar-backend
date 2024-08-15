const { app } = require("firebase-admin");
const userModel = require("../models/user");

const getNotification = async (req, res) => {
    try {
        const id = req.userId;
        const user = await userModel.findById(id);

        // Sort notifications by creation date in descending order
        const sortedNotifications = user.notifications.sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        res.json(sortedNotifications);
    } catch (err) {
        res.status(500).send(err);
    }
};

module.exports = { getNotification };
