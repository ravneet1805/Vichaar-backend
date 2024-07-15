const mongoose = require("mongoose");
const express = require("express");
// const faker = require("faker");
const { faker } = require ("@faker-js/faker");
const User = require("./models/user"); // Adjust the path according to your project structure
const app = express();

mongoose.connect("mongodb+srv://ravneetsingh:QKM3et7gJV7tHLyx@cluster0.71gvnk2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", async function () {
  console.log("Connected to the database.");

  // Define the number of fake users you want to create
  const numberOfFakeUsers = 1000;

  // Create an array to hold the fake user data
  const fakeUsers = [];

  for (let i = 0; i < numberOfFakeUsers; i++) {
    fakeUsers.push({
      fullName: faker.internet.displayName(),
      userName: faker.internet.userName(),
      linkedinId: faker.string.uuid(),
      linkedinLink: faker.internet.url(),
      githubLink: faker.internet.url(),
      bio: faker.lorem.sentences(2),
      skills: faker.lorem.words(5).split(" "),
      email: faker.internet.email(),
      password: "pass",
      image: faker.image.avatar(),
      followers: [],
      following: [],
    });
  }

  try {
    await User.insertMany(fakeUsers);
    console.log("Fake users have been added successfully.");
  } catch (err) {
    console.error("Error adding fake users:", err);
  } finally {
    mongoose.connection.close();
  }
});

app.listen(6000, () => {
  console.log("server started")
})
