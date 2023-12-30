const noteModel = require("../models/note");

const createNote = async (req, res) => {
  const { title } = req.body;
  const newNote = new noteModel({
    title: title,
    userId: req.userId,
  });
  try {
    await newNote.save();
    res.status(201).json(newNote);
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: "something went wrong" });
  }
};

const updateNote = async (req, res) => {
  const id = req.params.id;

  const { title } = req.body;

  const newNote = {
    title: title,
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

const likeNote = async (req, res) => {
  try {
    const id = req.params.id;

    const result = await noteModel
      .findByIdAndUpdate(id, { $addtoSet: { likes: req.userId } }, { new: true })

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};

const unlikeNote = async (req, res) => {
    const id = req.params.id;
  
    try {
      const result = await noteModel
        .findByIdAndUpdate(id, { $pull: { likes: req.userId } }, { new: true })
        
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ message: err.message || "Internal Server Error" });
    }
  };
  

module.exports = {
  createNote,
  deleteNote,
  updateNote,
  getUserNote,
  likeNote,
  unlikeNote,
  getNote,
};
