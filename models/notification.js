const mongoose = require('mongoose');


const notificationSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uniqueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Note',
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
