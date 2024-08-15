const noteModel = require("../models/note");
const notification = require("../models/notification");
const userModel = require("../models/user");
const admin = require('firebase-admin');


const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "dekqiflmi",
  api_key: "882198819354699",
  api_secret: "_9NMHEm1wf80p37Qdc3FSE3UBok",
});

const createNote = async (req, res) => {
  try {
    let imageUrl = null;

    if (req.files && req.files.photo) {
      const file = req.files.photo;
      const photoData = await cloudinary.uploader.upload(file.tempFilePath, {
        transformation: [
          { width: 800, height: 600, crop: "limit" },
          { quality: "80" }
        ]
      });
      imageUrl = photoData.url;
    }

    const { title, requiredSkills } = req.body;

    const newNote = new noteModel({
      title: title,
      image: imageUrl, // This will be null if no image is uploaded
      requiredSkills: JSON.parse(requiredSkills),
      userId: req.userId,
    });

    await newNote.save();
    res.status(201).json(newNote);

  } catch (error) {
    console.error("Error creating note:", error);
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};


const updateNote = async (req, res) => {
  const id = req.params.id;

  const { title, image, requiredSkills } = req.body;

  const newNote = {
    title: title,
    image: image,
    requiredSkills: requiredSkills,
    userId: req.userId,
  };

  try {
    await noteModel.findByIdAndUpdate(id, newNote, { new: true });
    res.status(200).json(newNote);
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: "something went wrong" });
  }
};

const deleteNote = async (req, res) => {
  const id = req.params.id;

  try {
    const note = await noteModel.findByIdAndDelete(id);
    res.status(202).json(note);
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: "something went wrong" });
  }
};

const getNote = async (req, res) => {
  const id = req.userId;
  try {
    const notes = await noteModel
      .find()
      .sort({ createdAt: -1 })
      .populate("userId");
    res.status(200).json(notes);
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: "something went wrong" });
  }
};

const getRecomendedNote = async (req, res) => {
  const id = req.userId;
  try {
    // Fetch user skills
    const user = await userModel.findById(id).select('skills');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userSkills = user.skills;

    // Find notes that match the user's skills
    let notes = await noteModel.find({
      requiredSkills: { $in: userSkills }
    })
      .sort({ createdAt: -1 })
      .populate("userId");

    // If not enough matching notes, fetch additional notes to maintain engagement

    const additionalNotes = await noteModel.find({
      _id: { $nin: notes.map(note => note._id) }
    })
      .sort({ createdAt: -1 })
      .populate("userId")

    notes = notes.concat(additionalNotes);


    res.status(200).json(notes);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
};


const getFollowingUserNotes = async (req, res) => {
  try {
    // Get the list of users that the current user is following
    console.log("entered follow ig vsonvsdign")
    console.log(req.userId)
    const user = await userModel
      .findById(req.userId)
      .populate("following", "_id");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get the list of following user IDs
    const followingUserIds = user.following.map(
      (followingUser) => followingUser._id
    );

    console.log(followingUserIds)

    // Retrieve the notes from the users that the current user is following
    const notes = await noteModel
      .find({ userId: { $in: followingUserIds } })
      .sort({ createdAt: -1 })
      .populate("userId");


    console.log(notes)


    res.status(200).json(notes);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
const getUserNote = async (req, res) => {
  try {
    const notes = await noteModel
      .find({ userId: req.userId })
      .sort({ createdAt: -1 });
    res.status(200).json(notes);
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: "something went wrong" });
  }
};
const getspecificUserNote = async (req, res) => {
  const id = req.params.id;
  try {
    const notes = await noteModel
      .find({ userId: id })
      .sort({ createdAt: -1 })
      .populate("userId")
    res.status(200).json(notes);
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: "something went wrong" });
  }
};

const likeNote = async (req, res) => {
  try {
    const id = req.params.id;
    const receiverNote = await noteModel.findById(id)
    const receiver = await userModel.findById(receiverNote.userId)
    const sender = await userModel.findById(req.userId)

    const result = await noteModel.findByIdAndUpdate(
      id,
      { $addToSet: { likes: req.userId } },
      { new: true }
    );

    // Create a new notification
    if (receiver != sender) {
      const newNotification = {
        senderId: sender._id,
        uniqueId: id,
        title: "Like",
        message: `${sender.fullName} liked your Vichaar`,
      };
    

    await userModel.findByIdAndUpdate(
      receiverNote.userId,
      {
        $push: {
          notifications: newNotification
        }
      }
    )

  }


    // Get the FCM token of the user who created the note
    const fcmToken = receiver.deviceToken
    console.log("device Token: " + fcmToken)



    // Construct the notification message for each token
    const notificationPromises = fcmToken.map(token => {
      const message = {
        notification: {
          title: "Like",
          body: `${sender.fullName} liked your Vichaar`,
        },
        token: token,
      };

      // Send the notification
      return admin.messaging().send(message)
        .then((response) => {
          console.log(`Successfully sent message to token ${token}:`, response);
        })
        .catch((error) => {
          console.error(`Error sending message to token ${token}:`, error);
        });
    });

    // Wait for all notifications to be sent
    await Promise.all(notificationPromises);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};

const unlikeNote = async (req, res) => {
  try {
    const id = req.params.id;

    const note = await noteModel.findById(id);
    const receiverId = note.userId;
    const sender = await userModel.findById(req.userId)
    const senderId = req.userId;


    const result = await noteModel.findByIdAndUpdate(
      id,
      { $pull: { likes: req.userId } },
      { new: true }
    );


    // Remove the corresponding notification
    await userModel.findByIdAndUpdate(
      receiverId,
      {
        $pull: {
          notifications: {
            senderId: senderId,
            uniqueId: id,
            message: { $regex: ' liked your Vichaar' }
          }
        }
      }
    );

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};

const markInterested = async (req, res) => {
  try {
    const id = req.params.id;
    const receiverNote = await noteModel.findById(id)
    const receiver = await userModel.findById(receiverNote.userId)
    const sender = await userModel.findById(req.userId)

    const result = await noteModel.findByIdAndUpdate(
      id,
      { $addToSet: { interested: req.userId } },
      { new: true }
    );


    // Create a new notification
    const newNotification = {
      senderId: sender._id,
      uniqueId: id,
      title: "Interested",
      message: `${sender.fullName} is interested in your Vichaar`,
    };

    await userModel.findByIdAndUpdate(
      receiverNote.userId,
      {
        $push: {
          notifications: newNotification
        }
      }

    )

  

    // Get the FCM token of the user who created the note
    const fcmToken = receiver.deviceToken
    console.log("device Token: " + fcmToken)




    // Construct the notification message for each token
    const notificationPromises = fcmToken.map(token => {
      const message = {
        notification: {
          title: "Interested",
          body: `${sender.fullName} is interested in your Vichaar`,
        },
        token: token,
      };

      // Send the notification
      return admin.messaging().send(message)
        .then((response) => {
          console.log(`Successfully sent message to token ${token}:`, response);
        })
        .catch((error) => {
          console.error(`Error sending message to token ${token}:`, error);
        });
    });

    // Wait for all notifications to be sent
    await Promise.all(notificationPromises);
    res.status(200).json(result);


  } catch (err) {
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
}

const notInterested = async (req, res) => {

  try {
    const id = req.params.id;
    const note = await noteModel.findById(id);
    const receiverId = note.userId;
    const senderId = req.userId;
    const result = await noteModel.findByIdAndUpdate(
      id,
      { $pull: { interested: req.userId } },
      { new: true }
    );

    // Remove the corresponding notification
    await userModel.findByIdAndUpdate(
      receiverId,
      {
        $pull: {
          notifications: {
            senderId: senderId,
            uniqueId: id,
            message: { $regex: ' is interested' }
          }
        }
      }
    );

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};

const getInterestedUsers = async (req, res) => {
  const noteId = req.params.id;

  try {
    const note = await noteModel
      .findById(noteId)
      .populate("interested");
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    const sortedUsers = note.interested.sort(
      (a, b) => b.createdAt - a.createdAt
    );

    res.json(sortedUsers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getComments = async (req, res) => {
  const noteId = req.params.id;

  try {
    const note = await noteModel
      .findById(noteId)
      .populate("comments.user", "name image");
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    const sortedComments = note.comments.sort(
      (a, b) => b.createdAt - a.createdAt
    );

    res.json(sortedComments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const addComment = async (req, res) => {
  try {
    const noteId = req.params.id;
    const { text } = req.body;
    const newComment = {
      user: req.userId,
      text: text,
    };

    const result = await noteModel
      .findByIdAndUpdate(
        noteId,
        { $push: { comments: newComment } },
        { new: true }
      )
      .populate("comments.user"); // Populate user information for the new comment


    const receiverNote = await noteModel.findById(noteId)
    const receiver = await userModel.findById(receiverNote.userId)
    const sender = await userModel.findById(req.userId)
    const commentsLength = result.comments.length
    const commentId = result.comments[commentsLength - 1]._id

    // Create a new notification
    const newNotification = {
      senderId: sender._id,
      uniqueId: commentId,
      title: "Comment",
      message: `${sender.fullName} commented: ${text}`,
    };

    await userModel.findByIdAndUpdate(
      receiverNote.userId,
      {
        $push: {
          notifications: newNotification
        }
      }

    )


    // Get the FCM token of the user who created the note
    const fcmToken = receiver.deviceToken
    console.log("device Token: " + fcmToken)

    // Construct the notification message for each token
    const notificationPromises = fcmToken.map(token => {
      const message = {
        notification: {
          title: "Comment",
          body: sender.fullName+" commented: "+text,
        },
        token: token,
      };

      // Send the notification
      return admin.messaging().send(message)
        .then((response) => {
          console.log(`Successfully sent message to token ${token}:`, response);
        })
        .catch((error) => {
          console.error(`Error sending message to token ${token}:`, error);
        });
    });

    // Wait for all notifications to be sent
    await Promise.all(notificationPromises);

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};

const updateComment = async (req, res) => {
  const noteId = req.params.noteId;
  const commentId = req.params.commentId;
  const { text } = req.body;
  try {
    const result = await noteModel
      .findOneAndUpdate(
        { _id: noteId, "comments._id": commentId },
        { $set: { "comments.$.text": text } },
        { new: true }
      )
      .populate("comments.user");
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { noteId, commentId } = req.params;

    const note = await noteModel.findById(noteId);
    const receiverId = note.userId;
    const senderId = req.userId;

    const result = await noteModel
      .findByIdAndUpdate(
        noteId,
        { $pull: { comments: { _id: commentId } } },
        { new: true }
      )
      .populate("comments.user");


    // Remove the corresponding notification
    await userModel.findByIdAndUpdate(
      receiverId,
      {
        $pull: {
          notifications: {
            senderId: senderId,
            uniqueId: commentId,
            message: { $regex: ` commented:` }
          }
        }
      }
    );

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};


const getTrendingNotes = async (req, res) => {
  try {
    const trendingNotes = await noteModel
      .find()
      .sort({ likes: -1 }) // Sort by the number of likes in descending order
      .limit(10) // Limit to the top 10 trending notes
      .populate("userId")
      .populate("comments.user");

    res.status(200).json(trendingNotes);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};


const getTrendingSkills = async (req, res) => {
  try {
    const skills = await noteModel.aggregate([
      { $unwind: "$requiredSkills" },
      { $group: { _id: "$requiredSkills", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { skill: "$_id", count: 1, _id: 0 } }
    ]);

    res.status(200).json(skills);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};


const getNotesForSpecificSkill = async (req, res) => {
  const skill = req.params.skill;
  try {
    const notes = await noteModel
      .find({ requiredSkills: skill })
      .sort({ createdAt: -1 })
      .populate("userId")
      .populate("comments.user");

    res.status(200).json(notes);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};


module.exports = {
  createNote,
  deleteNote,
  updateNote,
  getUserNote,
  likeNote,
  unlikeNote,
  markInterested,
  notInterested,
  getInterestedUsers,
  getNote,
  getRecomendedNote,
  getFollowingUserNotes,
  getspecificUserNote,
  getComments,
  addComment,
  updateComment,
  deleteComment,
  getTrendingNotes,
  getTrendingSkills,
  getNotesForSpecificSkill
};
