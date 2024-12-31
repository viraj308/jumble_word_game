const mongoose = require("mongoose")

const connect =  () => {
    // MongoDB Connection
    mongoose.connect("mongodb+srv://virajchavan308:MADHUSUDAN@cluster0.d3pa3.mongodb.net/Jumbled_word_game?retryWrites=true&w=majority&appName=Cluster0", {
    }).then(() => console.log("MongoDB Connected"))
    .catch((err) => console.log("MongoDB Connection Error:", err));

    mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to database');
    });
}

module.exports = { connect }