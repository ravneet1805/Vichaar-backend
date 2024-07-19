const mongoose = require("mongoose");
const user = require("./user");

const NoteSchema = mongoose.Schema({

    title : {
        type : String,
        required : true
    },

    image : {
        type: String,

    },

    requiredSkills : [{
        type: String

    }],

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
    ],

    interested : [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"

        }
    ],

    comments: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true
            },
            text: {
                type: String,
                required: true
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    
    // Array for comments
    
    
    
},{timestamps: true}
)

module.exports = mongoose.model("Note", NoteSchema)