const mongoose = require("mongoose");

const userSchema = mongoose.Schema({

    name : {
        type : String,
        required : true
    },

    userName: {
        type: String,
        required : true,
        unique : true
    },

    linkedinId : {
        type : String,
        //required : true
    },
    
    linkedinLink : {
        type: String
    },

    githubLink : {
        type: String
    },

    bio : {
        type: String
    },

    skills : [
        {
            type: String
        }
    ],

    email : {
        type : String,
        required : true,
        unique: true
    },

    password : {
        type : String,
        //required : true
    },

    image : {
        type: String,
        //required : true
    },

    followers:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],

    following:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ]
},{timestamps: true}
)

module.exports = mongoose.model("User", userSchema)