const { model } = require("mongoose");
const userModel = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const SECRET_KEY = "NOTEAPI";
const cloudinary = require("cloudinary").v2;
const OTP = require("../models/otp");

cloudinary.config({
  cloud_name: "dekqiflmi",
  api_key: "882198819354699",
  api_secret: "_9NMHEm1wf80p37Qdc3FSE3UBok",
});

const checkUsernameAvailability = async (req, res) => {
  console.log("enterebgdonfvcobuuodf");
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ message: "Username is required" });
  }

  try {
    const existingUser = await userModel.findOne({ userName: username });
    if (existingUser) {
      return res.status(200).json({ available: false });
    } else {
      return res.status(200).json({ available: true });
    }
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

const signup = async (req, res) => {
  //const file = req.files.photo;

  //try {
  // cloudinary.uploader.upload(file.tempFilePath, async (err, photoData) => {
  //     console.log(photoData)
  //     console.log(err)

  const {
    //name,
    email,
    password,
    userName,
    otp,
    // githubLink,
    // linkedinLink,
    // bio,
    // skills,
  } = req.body;

  if (!userName || !email || !password || !otp) {
    return res.status(403).json({
      success: false,
      message: "All fields are required",
    });
  }

  try {
    const existingEmail = await userModel.findOne({ email: req.body.email });
    const existingUserName = await userModel.findOne({
      userName: req.body.userName,
    });

    if (existingEmail && existingEmail._id.toString() !== userId) {
      return res.status(400).json({ message: "Email already in use." });
    }

    if (existingUserName && existingUserName._id.toString() !== userId) {
      return res.status(400).json({ message: "Username already in use." });
    }

    // Find the most recent OTP for the email
    const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
    if (response.length === 0 || otp !== response[0].otp) {
      return res.status(400).json({
        success: false,
        message: "The OTP is not valid",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await userModel.create({
      //name: name,
      userName: userName,
      email: email,
      password: hashedPassword,
      // bio: bio,
      // githubLink: githubLink,
      // linkedinLink: linkedinLink,
      // skills,
      // image: photoData.url
    });

    const token = jwt.sign({ email: result.email, id: result._id }, SECRET_KEY);
    console.log(result);
    res.status(201).json({
      message: "Account created succesfully",
      user: result,
      token: token,
    });
    //     } catch (error) {
    //         console.log(error);
    //         cloudinary.uploader.destroy(photoData.public_id);
    //         res.status(500).json("Something went wrong.");
    //     }
    // })
  } catch (err) {
    console.log(err),
      //cloudinary.uploader.destroy(photoData.public_id);
      res.status(500).json(err);
  }
};

const updateUserInfo = async (req, res) => {
  const userId = req.userId;
  const file = req.files ? req.files.photo : null;

  // if (file == null) {
  //     return res.status(403).json({
  //       success: false,
  //       message: 'image required',
  //     });
  //   }

  try {
    cloudinary.uploader.upload(file.tempFilePath, async (err, photoData) => {
      console.log(photoData);
      console.log(err);
      const { githubLink, linkedinLink, bio, skills, fullName } = req.body;

      try {
        console.log(userId);
        console.log(fullName);
        console.log(bio);
        console.log(linkedinLink);
        console.log(githubLink);
        console.log(skills);
        // Update user information
        const updatedUser = await userModel.findByIdAndUpdate(
          userId,
          {
            image: photoData.url,
            githubLink,
            linkedinLink,
            bio,
            skills: JSON.parse(skills),
            fullName,
          },
          { new: true }
        ); // `new: true` returns the updated document

        res
          .status(200)
          .json({ user: updatedUser, message: "Details added seccessfully " });
      } catch (error) {
        console.log(error);
        cloudinary.uploader.destroy(photoData.public_id);
        res.status(500).json("Something went wrong.");
      }
    });
  } catch (error) {
    console.error(error);
    cloudinary.uploader.destroy(photoData.public_id);
    res.status(500).json({ message: "Something went wrong." });
  }
};

const getUser = async (req, res) => {
  const userId = req.params.id;

  try {
    const userData = await userModel
      .find({ _id: userId })
      .populate("followers following");
    res.status(200).json(userData);
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: "something went wrong" });
  }
};

const searchUsers = async (req, res) => {
  console.log(req.params.key);
  let data = await userModel.find({
    fullName: { $regex: new RegExp(req.params.key, "i") },
  });

  res.send(data);
};

const signin = async (req, res) => {
  const { identifier, password } = req.body;

  if(!identifier){
    return res.status(404).json({message: "Email or Password is required"})
  }

  try {
    const existingUser = await userModel.findOne({
      $or: [{ email: identifier }, { userName: identifier }],
    });

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

    console.log(existingUser)

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
      user.followers = user.followers.filter(
        (id) => id.toString() !== followerId.toString()
      );
      await user.save();

      follower.following = follower.following.filter(
        (id) => id.toString() !== userId.toString()
      );
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

const upadteProfile = async (req, res) => {
    const userId = req.userId;
    const image = req.files ? req.files.photo : null;

    try {
        
     const  {
            fullName,
            userName,
            bio,
            githubLink,
            linkedinLink,
        } = req.body;

        const updatedData = {
            fullName,
            userName,
            bio,
            githubLink,
            linkedinLink,
            image
        }

        if(userName == ""){
           return res.status(404).json({message: "Username cannot be null"})
        }

        if (userName) {
            const userNameExists = await userModel.findOne({ userName, _id: { $ne: userId } });
            if (userNameExists) {
                return res.status(400).json({ message: 'Username already in use' });
            }
        }

        const updatedUser = await userModel.findByIdAndUpdate(userId, updatedData, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: updatedUser
        });

    }

        catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }

}



module.exports = {
    signin,
    signup,
    searchUsers,
    getUser,
    followUser,
    unfollowUser,
    updateUserInfo,
    checkUsernameAvailability,
    upadteProfile
};
