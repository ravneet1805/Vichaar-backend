const express = require("express");
const { getNote, getUserNote, createNote, deleteNote, updateNote, likeNote, unlikeNote } = require("../controllers/noteCOntroller");
const auth = require('../middleware/auth')
const noteRouter = express.Router();

noteRouter.get("/", auth, getNote)

noteRouter.get("/user", auth, getUserNote)

noteRouter.post("/", auth, createNote)

noteRouter.delete("/:id",auth,  deleteNote)

noteRouter.put("/:id", auth, updateNote)

noteRouter.put("/like/:id", auth, likeNote)

noteRouter.put("/unlike/:id", auth, unlikeNote)


module.exports = noteRouter;