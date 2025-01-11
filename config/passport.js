const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User")

require('dotenv').config();

const client_id = process.env.CLIENT_ID
const client_secret = process.env.CLIENT_SECRET

const setupPassport = () => {
    // Passport Google OAuth configuration
    passport.use(new GoogleStrategy({
        clientID: client_id,
        clientSecret: client_secret,
        callbackURL: "http://localhost:5000/auth/google/callback"
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("Google Profile Received:", profile); // Debugging Profile
        let user = await User.findOne({ googleId: profile.id });
        console.log(user)
        if (!user) {
            console.log("Creating new user...");
            user = new User({
                googleId: profile.id,
                name: profile.displayName,
                image: profile.photos[0].value,
            });
            await user.save();
        } else {
            console.log("User already exists:", user);
        }
        done(null, user);
    } catch (error) {
        console.log("Error in Google Strategy:", error);
        done(error, null);
    }
    
    }));

    passport.serializeUser((user, done) => {
        console.log("Serializing User:", user.id); // Debugging Serialization
        done(null, user.id);
      });
      
    passport.deserializeUser(async (id, done) => {
        try {
            console.log("Deserializing User:", id); // Debugging Deserialization
            const user = await User.findById(id);
            if (!user) {
                console.log("User not found during deserialization");
                return done(null, false); // No user found
            }
            done(null, user); // Pass the user to Passport
        } catch (err) {
            console.log("Error in Deserialization:", err);
            done(err, null); // Handle error
        }
    });
}

module.exports = setupPassport;