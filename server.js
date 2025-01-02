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
app.use(cors());
app.use(express.json());
app.use(session({
    secret: "secret-key", 
    resave: false,
    saveUninitialized: true
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

// Start Server
const PORT = 5000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

