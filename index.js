const express = require("express");
const socketIO = require("socket.io");
const http = require("http");
const userRouter = require("./routes/userRoutes");
const noteRouter = require("./routes/noteRoutes");
const passport = require('passport');
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const session = require('express-session');
const app = express();
const mongoose = require("mongoose");
const fileUpload = require('express-fileupload')

app.use(express.json())


// Initialize express-session middleware
app.use(session({
    secret: 'sessionvichaar061', // Change this to a secure random string
    resave: false,
    saveUninitialized: false
}));

// Initialize Passport middleware
app.use(passport.initialize());
app.use(passport.session());


// Configure the LinkedIn strategy
passport.use(new LinkedInStrategy({
    clientID: '86zgpoa1vowd7t',
    clientSecret: 'HfYEIA93IIDFLpuh',
    callbackURL: "https://vichaar.onrender.com/auth/linkedin/callback",
    scope: ['openid', 'profile', 'email'],
}, function(accessToken, refreshToken, profile, done) {
    // Handle errors explicitly
    if (profile.error) {
        return done(new Error(profile.error.message));
    }
    // Handle successful profile retrieval
    return done(null, profile);
}));

// Serialize and deserialize user sessions
passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

// Middleware to initialize Passport
app.use(passport.initialize());

// Route to start the LinkedIn OAuth flow
app.get('/auth/linkedin',
    passport.authenticate('linkedin', { state: 'random_state_string' }));

// Callback route after LinkedIn has authenticated the user
app.get('/auth/linkedin/callback',
    passport.authenticate('linkedin', { failureRedirect: '/login' }),
    function(req, res) {
        // Successful authentication, redirect home.
        console.log("LinkedIn Authenticated User Data:");
        console.log(req.user);
        res.redirect('/');
    });


app.use((req, res, next)=>{
    console.log("HTTP method:"+req.method+"URL:"+req.url);

    next();
})

app.use(fileUpload({
    useTempFiles: true
}))




app.use("/users", userRouter);
app.use("/notes", noteRouter);


app.get("/", (req,res)=>{
    res.status(200).send("hello ravneet")
})



mongoose.connect("mongodb+srv://ravneetsingh:QKM3et7gJV7tHLyx@cluster0.71gvnk2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
.then(()=>{
    console.log("connected to DB");
})
.catch((error)=>{
    console.log(error)
})

//Socket Logic
const socketio = require('socket.io')(http)

socketio.on("connection", (userSocket) => {
    userSocket.on("send_message", (data) => {
        userSocket.broadcast.emit("receive_message", data)
    })
})

const server = app.listen(8000, ()=>{
    console.log("server started")
})


