const { model } = require("mongoose");
const userModel = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const SECRET_KEY = "NOTEAPI";
const cloudinary = require('cloudinary').v2


cloudinary.config({
    cloud_name: 'dekqiflmi',
    api_key: '882198819354699',
    api_secret: '_9NMHEm1wf80p37Qdc3FSE3UBok'
});



const signup = async (req, res) =>  {
    const file = req.files.photo;
    cloudinary.uploader.upload(file.tempFilePath, async (err,photoData) =>{
        console.log(photoData)
        console.log(err)

        const { name, email, password } = req.body;

        try {
            const existingUser = await userModel.findOne({ email: email });
    
            if (existingUser) {
                return res.status(400).json({ message: "User Already Exists." });
            }
    
            const hashedPassword = await bcrypt.hash(password, 10);
    
            const result = await userModel.create({
                name: name,
                email: email,
                password: hashedPassword,
                image: photoData.url
            });
    
            const token = jwt.sign({ email: result.email, id: result._id }, SECRET_KEY);
            console.log(result)
            res.status(201).json({
                user: result,
                token: token,
            });
        } catch (error) {
            console.log(error);
            res.status(500).json("Something went wrong.");
        }
    })


};



const getUser = async (req, res) => {
    const userId = req.params.id;

    try {
        const userData = await userModel
            .find({ _id: userId }).populate('followers following');
        res.status(200).json(userData);
    } catch (error) {
        console.log(error);

        res.status(500).json({ message: "something went wrong" });
    }
}



const searchUsers = async (req, res) => {
    console.log(req.params.key);
    let data = await userModel.find({
        name: { $regex: new RegExp(req.params.key, "i") },
    });

    res.send(data);
};

const signin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const existingUser = await userModel.findOne({ email: email });

        if (!existingUser) {
            return res.status(404).json({ message: "User Not Exist." });
        }

        const matchPassword = await bcrypt.compare(password, existingUser.password);
        if (!matchPassword) {
            return res.status(400).json({ message: "Incorrect Password." });
        }

        const token = jwt.sign(
            { email: existingUser.email, id: existingUser._id },
            SECRET_KEY
        );

        res
            .status(201)
            .json({ message: "Login Success", user: existingUser, token: token });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something Went Wrong." });
    }
};


const followUser = async (req, res) => {
    const userId = req.params.id;
    const followerId = req.userId;

    try {
        const user = await userModel.findById(userId);
        const follower = await userModel.findById(followerId);

        if (!user || !follower) {
            return res.status(404).json({ error: "User not found" });
        }

        if (!user.followers.includes(followerId)) {
            user.followers.push(followerId);
            await user.save();

            follower.following.push(userId);
            await follower.save();

            res.status(200).json({ message: "Followed successfully" });
        } else {
            res.status(400).json({ error: "Already following this user" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const unfollowUser = async (req, res) => {
    const userId = req.params.id;
    const followerId = req.userId;

    try {
        const user = await userModel.findById(userId);
        const follower = await userModel.findById(followerId);

        if (!user || !follower) {
            return res.status(404).json({ error: "User not found" });
        }

        if (user.followers.includes(followerId)) {
            user.followers = user.followers.filter(id => id.toString() !== followerId.toString());
            await user.save();

            follower.following = follower.following.filter(id => id.toString() !== userId.toString());
            await follower.save();

            res.status(200).json({ message: "Unfollowed successfully" });
        } else {
            res.status(400).json({ error: "Not following this user" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = {
    followUser,
    unfollowUser
};


module.exports = { signin, signup, searchUsers, getUser, followUser, unfollowUser };
