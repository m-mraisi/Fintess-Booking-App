const mongoose = require("mongoose");
const mongoURI = process.env.MONGOURI;

const connectDb = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log("Connected to db");
  } catch (error) {
    console.log("Error connecting to db", error);
  }
};
module.exports = { connectDb };
