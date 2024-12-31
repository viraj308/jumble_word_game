/* const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    googleId: { type: String, required: true },
    name: { type: String, required: true },
    image: { type: String, required: true }
});

module.exports = mongoose.model("User", userSchema); */
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    googleId: String,
    name: String,
    image: String,
});

const User = mongoose.model('User', userSchema);

module.exports = User;
