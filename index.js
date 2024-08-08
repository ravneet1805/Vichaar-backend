const express = require("express");
const socketIO = require("socket.io");
const http = require("http");
const userRouter = require("./routes/userRoutes");
const noteRouter = require("./routes/noteRoutes");
const otpRouter = require("./routes/otpRoutes");
const passport = require('passport');
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const session = require('express-session');
const cors = require('cors'); // Add this line
const app = express();
const mongoose = require("mongoose");
const fileUpload = require('express-fileupload')
const userModel = require("./models/user");
const jwt = require("jsonwebtoken");
const firebase = require("firebase-admin/messaging")
const serviceAccountLocation = require("./vichaar-31878-firebase-adminsdk-76swt-790b280f53.json")

app.use(express.json())

// Add CORS middleware
app.use(cors());

var admin = require("firebase-admin");

var serviceAccount = serviceAccountLocation;

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });


app.use(session({
    secret: 'sessionvichaar061', // Change this to a secure random string
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LinkedInStrategy({
    clientID: '86zgpoa1vowd7t',
    clientSecret: 'HfYEIA93IIDFLpuh',
    callbackURL: "https://vichaar.onrender.com/auth/linkedin/callback",
    scope: ['openid','profile', 'email'],
    profileFields: ['id', 'first-name', 'last-name', 'email-address', 'headline']
}, async(accessToken, refreshToken, openid, profile, done) => {
    try {
        console.log("LinkedIn Profile Data:", profile);
        console.log(accessToken)

        const linkedinId = profile.id;
        const name = profile.displayName;
        const email = profile.email; // Assuming you have a way to get email from the profile
        const image = profile.picture; // Assuming the picture is available in the profile object

        let user = await userModel.findOne({ email: email });

        if (user) {
            user.linkedinId = profile.id;
            user.name = profile.displayName;
            user.email = profile.email;
            user.image = profile.picture;
            await user.save();
            const token = jwt.sign({ email: user.email, id: user._id }, 'NOTEAPI');
            return done(null, { user, token });
        } else {
            user = await userModel.create({
                linkedinId: linkedinId,
                name: name,
                email: email,
                image: image
            });

            const token = jwt.sign({ email: user.email, id: user._id }, 'NOTEAPI');
            return done(null, { user, token });
        }
    } catch (error) {
        return done(error);
    }
}));



passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

app.get('/auth/linkedin',
    passport.authenticate('linkedin', { state: 'random_state_string' }));

    try{

// Updated this route to send a JSON response
app.get('/auth/linkedin/callback',
    passport.authenticate('linkedin', { failureRedirect: '/login' }),
    function(req, res) {
        const userData = req.user;
        console.log("LinkedIn Authenticated User Data:");
        console.log(userData);

        // Send JSON response instead of redirecting
        res.status(201).json({ message: "Login Success", user: userData.user, token: userData.token });
    });

} catch(error){
    console.log(error)
}

app.use((req, res, next) => {
    console.log("HTTP method:" + req.method + "URL:" + req.url);
    next();
})

app.use(fileUpload({
    useTempFiles: true
}))

app.use("/users", userRouter);
app.use("/notes", noteRouter);
app.use("/auth", otpRouter);


app.get("/", (req, res) => {
    res.status(200).send("hello ravneet")
})

mongoose.connect("mongodb+srv://ravneetsingh:QKM3et7gJV7tHLyx@cluster0.71gvnk2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
    .then(() => {
        console.log("connected to DB");
    })
    .catch((error) => {
        console.log(error)
    })

const socketio = require('socket.io')(http)

socketio.on("connection", (userSocket) => {
    userSocket.on("send_message", (data) => {
        userSocket.broadcast.emit("receive_message", data)
    })
})

const server = app.listen(8000, () => {
    console.log("server started")
})
