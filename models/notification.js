const mongoose = require('mongoose');
const { Schema } = mongoose;

const notificationSchema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // The user to be notified
  noteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Note' }, // The note related to the notification
  commentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }, // The comment related to the notification
  type: { type: String, enum: ['comment', 'like'], required: true }, // Type of notification
  createdAt: { type: Date, default: Date.now }
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
