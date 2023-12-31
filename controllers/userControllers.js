const { model } = require("mongoose");
const userModel = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const SECRET_KEY = "NOTEAPI";

const signup = async (req, res) => {
    //existing user
    //hashed password
    //user created
    //token generated

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
        });

        const token = jwt.sign({ email: result.email, id: result._id }, SECRET_KEY);
        res.status(201).json({
            user: result,
            token: token,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json("Something went wrong.");
    }
};



const getUser = async (req, res) => {
    const userId = req.params.id;

    try {
        const userData = await userModel
            .find({ _id: userId });
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

module.exports = { signin, signup, searchUsers, getUser };
