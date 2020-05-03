const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true
  },
  lastname: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  btc: {
    type: String,
    required: false
  },
  progress: {
    type: String,
    required: false
  },
  dp: {
    type: String,
    required: false
  },
  balance: {
    type: Number,
    required: false
  },
  amount: {
    type: Number,
    required: false
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model("User", UserSchema);

module.exports = User;