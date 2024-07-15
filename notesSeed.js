const mongoose = require("mongoose");
const express = require("express");
// const faker = require("faker");
const { faker } = require ("@faker-js/faker");
const Note = require("./models/note"); // Adjust the path according to your project structure
const app = express();
const User = require("./models/user");


async function seedNotes() {


  await mongoose.connect('mongodb+srv://ravneetsingh:QKM3et7gJV7tHLyx@cluster0.71gvnk2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Define the number of fake users you want to create
  const numberOfFakeNotes = 2000; // Adjust the number of fake notes you want to create
  const users = await User.find(); // Fetch all users to assign as note owners

  const fakeNotes = [];

  for (let i = 0; i < numberOfFakeNotes; i++) {
    const randomUser = users[Math.floor(Math.random() * users.length)];

    fakeNotes.push({
      title: faker.lorem.sentence(),
      image: faker.image.url(),
      requiredSkills: faker.lorem.words(5).split(' '),
      userId: randomUser._id, // Assign a random user ID
      likes: [], // You can populate this if needed
      interested: [], // You can populate this if needed
      comments: [], // Start with no comments
    });
  }

  try {
    await Note.insertMany(fakeNotes);
    console.log('Fake notes have been added successfully.');
  } catch (err) {
    console.error('Error adding fake notes:', err);
  } finally {
    mongoose.connection.close();
  }
}

seedNotes();
