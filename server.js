const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const helmet = require("helmet");
const cors = require("cors");
const session = require("express-session")
const { setupSockets } = require("./config/socket")

const passport = require("passport");
const db = require("./config/db");
const setupPassport = require("./config/passport");

require('dotenv').config();

const MONGO_URL = process.env.MONGO_URL

const MongoStore = require("connect-mongo");  // Import MongoStore

// Initialize MongoDB Connection
db.connect();

// Initialize Passport
setupPassport(passport);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});


// Middleware
app.use(
  cors({
      origin: "http://localhost:5173", // Replace with your frontend's URL
      credentials: true, // Allow cookies and credentials to be sent
  })
);
app.use(express.json());
app.use(session({
    secret: "secret-key", 
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: MONGO_URL, // MongoDB connection URL (change it to your DB URI)
      collectionName: "sessions", // Optional, default is "sessions"
      ttl: 14 * 24 * 60 * 60, // Session expiration time (14 days)
    }),
    cookie: {
      httpOnly: true,
      secure: false, // Set to true if using HTTPS
      sameSite: "lax", // Adjust if stricter cross-site cookie handling is needed
  },
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(
    helmet({
      contentSecurityPolicy: false, // Disable CSP if causing conflicts
    })
  );

// Routes
app.use("/auth", require("./routes/auth"));

// Setup WebSocket events
setupSockets(io);


app.get('/', (req, res) => {
  res.send('Game Server is Running');
});

// Route to fetch user profile
app.get("/profile", (req, res) => {
  if (req.isAuthenticated()) {
    console.log("happy new year ....")
    console.log("req: " ,req.user)
    // If the user is authenticated, send their profile
    res.json({
      id: req.user._id,
      googleId: req.user.googleId,
      name: req.user.name,
      image: req.user.image,
    });
  } else {
    // If the user is not authenticated, send a 401 Unauthorized response
    res.status(401).json({ message: "Unauthorized: Please log in first." });
  }
});

// Start Server
const PORT = 5000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

