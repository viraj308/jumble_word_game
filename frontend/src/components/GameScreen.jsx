import React, { useState, useEffect } from "react";
import socket from "../socket";
import "./GameScreen.css"

function GameScreen({ lobyId, jumbledWord, timer, setTimer, currentRound, totalRounds, settings, playerName}) {
   /*  const [timer1, setTimer] = useState(timer);  */
    const [guess, setGuess] = useState("");
    const [notification, setNotification] = useState("");
    

    

    const lobbyId = lobyId;
    

    useEffect(() => {
        
        socket.on("roundTimeout", ({ correctWord }) => {
            setNotification(`Time's up! The correct word was: ${correctWord}`);
        });

        
        // Listen for incorrect guesses
        socket.on("incorrectGuess", ({ message }) => {
            setNotification(message);
        });

        return () => {
            socket.off("incorrectGuess");
            socket.off("roundTimeout");
            /* socket.off("lobbyReset") */
        };
    }, []);

    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

    const handleGuess = () => {
        if (guess.trim()) {
            socket.emit("guess", { lobbyId, guess, playerName });
            console.log(lobbyId)
            console.log(guess)
            setGuess("");
            setNotification("");
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === "Enter") {
            handleGuess(); // Call the submit function
        }
    };

    return (
        <div className="game-screen">
            <h2>Game Screen</h2>
            <p>
            Game Difficulty: <span>{settings.difficulty}</span>&nbsp;&nbsp;&nbsp;
            Time Limit: <span>{settings.timeLimit}</span>&nbsp;&nbsp;&nbsp;
            Rounds: <span>{settings.rounds}</span>
            </p>

            <p>Jumbled Word: <strong>{jumbledWord || "Waiting for game to start..."}</strong></p>
            <p>Time Left: <span>{timer}</span> seconds</p>
            <p>Round {currentRound} of {totalRounds}</p>
            <input
                type="text"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                onKeyDown={handleKeyDown} // Listen for keydown events
                placeholder="Type your guess here"
            />
            <button onClick={handleGuess} disabled={!jumbledWord}>
                Submit Guess
            </button>
            {notification && <p className="notification" style={{ color: "red" }}>{notification}</p>}
        </div>
    );
}

export default GameScreen;
