const express = require("express");
const passport = require("passport");

const router = express.Router();

// Passport Google OAuth setup
router.get("/google", passport.authenticate("google", {
    scope: ["profile", "email"]
}));

router.get("/google/callback", 
    passport.authenticate("google", { failureRedirect: "/" }),
    (req, res) => {
        // Redirect to game homepage after successful login
        res.redirect("http://localhost:5173");
    }
);

router.get("/logout", (req, res) => {
    req.logout((err) => {
        if (err) return res.status(500).send("Error logging out");
        res.redirect("http://localhost:5173"); // Redirect to the frontend home page
    });
});

module.exports = router;
