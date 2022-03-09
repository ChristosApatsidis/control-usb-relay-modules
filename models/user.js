const mongoose = require("mongoose")

// Define the User model schema
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    index: { unique: true },
    required: true
  },
  firstname: {
    type: String
  },
  lastname: {
    type: String
  },
  password: { 
    type: String 
  },
  registeredDate: {
    type: Date,
    default: Date.now 
  },
  lastSignin: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("User", UserSchema);