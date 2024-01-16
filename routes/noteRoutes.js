const express = require("express");
const { getNote,
    getUserNote,
    createNote,
    deleteNote,
    updateNote,
    likeNote,
    unlikeNote,
    getspecificUserNote,
    getComments,
    addComment,
    updateComment,
    deleteComment
} = require("../controllers/noteController");
const auth = require('../middleware/auth')
const noteRouter = express.Router();

noteRouter.get("/", auth, getNote)

noteRouter.get("/user", auth, getUserNote)

noteRouter.get("/user/:id", auth, getspecificUserNote)

noteRouter.post("/", auth, createNote)

noteRouter.delete("/:id", auth, deleteNote)

noteRouter.put("/:id", auth, updateNote)

noteRouter.put("/like/:id", auth, likeNote)

noteRouter.put("/unlike/:id", auth, unlikeNote)

noteRouter.get("/comment/:id", auth, getComments)

noteRouter.post("/comment/:id", auth, addComment)

noteRouter.put("/comment/:id", auth, updateComment)

noteRouter.delete("/comment/:id", auth, deleteComment)




module.exports = noteRouter;