/*

// src/models/userModel.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  isStudent: {
    type: Boolean,
    require: true,
  },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
*/

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    // other fields as necessary
});

const User = mongoose.model('User', userSchema);

module.exports = User;
