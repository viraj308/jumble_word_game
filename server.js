const session = require("express-session");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const helmet = require("helmet")
const User = require("./models/User")



const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const mongoose = require("mongoose");

// MongoDB Connection
mongoose.connect("mongodb+srv://virajchavan308:MADHUSUDAN@cluster0.d3pa3.mongodb.net/Jumbled_word_game?retryWrites=true&w=majority&appName=Cluster0", {
}).then(() => console.log("MongoDB Connected"))
.catch((err) => console.log("MongoDB Connection Error:", err));

mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to database');
});

console.log(User)


// Passport Google OAuth configuration
passport.use(new GoogleStrategy({
    clientID: "65851292117-91r01ul3vmkrkpsgilunr3346gbfrt36.apps.googleusercontent.com",
    clientSecret: "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",
    callbackURL: "http://localhost:5000/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log("Google Profile Received:", profile); // Debugging Profile
    let user = await User.findOne({ googleId: profile.id });
    console.log("=======================")
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

const app = express();

// Set up express-session
app.use(session({
  secret: "secret-key", 
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Use true if HTTPS is enabled
}));

app.use(passport.initialize());
app.use(passport.session());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Add Helmet middleware
app.use(helmet({
  contentSecurityPolicy: {
      directives: {
          defaultSrc: ["'self'"],
          imgSrc: ["'self'", "http://localhost:5000"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'"],
      },
  },
}));

// Routes
app.use("/auth", require("./routes/auth"));

// Middleware
app.use(cors());
app.use(express.json());

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


// Socket.IO for real-time events
io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);
    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});


app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// Start Server
const PORT = 5000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
