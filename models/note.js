const mongoose = require("mongoose");
const user = require("./user");

const NoteSchema = mongoose.Schema({

    title : {
        type : String,
        required : true
    },

    userId :{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    likes : [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ]
    
},{timestamps: true}
)

module.exports = mongoose.model("Note", NoteSchema)