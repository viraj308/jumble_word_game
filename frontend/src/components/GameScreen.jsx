import React, { useState, useEffect } from "react";
import socket from "../socket";

function GameScreen({ lobyId, jumbledWord }) {
    const [jumbleWord, setJumbleWord] = useState(jumbledWord);
    const [guess, setGuess] = useState("");
    const [notification, setNotification] = useState("");
    const [settings, setSettings] = useState({});
    const lobbyId = lobyId;
    

    useEffect(() => {
        // Listen for new words
        socket.on("newWord", ({ jumbledWord }) => {
            setJumbleWord(jumbledWord);
        });
        


        // Listen for incorrect guesses
        socket.on("incorrectGuess", (message) => {
            setNotification(message);
        });

        return () => {
            socket.off("newWord");
            socket.off("incorrectGuess");
        };
    }, []);

    const handleGuess = () => {
        if (guess.trim()) {
            socket.emit("guess", { lobbyId, guess });
            console.log(lobbyId)
            console.log(guess)
            setGuess("");
        }
    };

    return (
        <div>
            <h2>Game Screen</h2>
            <p>Jumbled Word: <strong>{jumbleWord || "Waiting for game to start..."}</strong></p>
            <input
                type="text"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                placeholder="Type your guess here"
            />
            <button onClick={handleGuess} disabled={!jumbleWord}>
                Submit Guess
            </button>
            {notification && <p style={{ color: "red" }}>{notification}</p>}
        </div>
    );
}

export default GameScreen;
