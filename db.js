const mongoose = require("mongoose");
const mongoURI =
  process.env.MONGOURI ||
  "mongodb+srv://admin:nL8ahtQpvGMZtLfo@cluster-1.bpugdk4.mongodb.net/fitness_g05?retryWrites=true&w=majority";

const connectDb = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log("Connected to db");
  } catch (error) {
    console.log("Error connecting to db", error);
  }
};
module.exports = { connectDb };
