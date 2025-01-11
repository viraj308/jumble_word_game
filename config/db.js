const mongoose = require("mongoose")
require('dotenv').config();

const db_url = process.env.MONGO_URL;

const connect =  () => {
    // MongoDB Connection
    mongoose.connect(db_url, {
    }).then(() => console.log("MongoDB Connected"))
    .catch((err) => console.log("MongoDB Connection Error:", err));

    mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to database');
    });
}

module.exports = { connect }