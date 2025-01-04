import React, { useState, useEffect } from "react";
import socket from "../socket";

function GameScreen({ lobyId, jumbledWord }) {
    const [jumbleWord, setJumbleWord] = useState(jumbledWord);
    const [guess, setGuess] = useState("");
    const [notification, setNotification] = useState("");
    const [settings, setSettings] = useState({});

    const [currentRound, setCurrentRound] = useState(1);
    const [totalRounds, setTotalRounds] = useState(5);
    const [timer, setTimer] = useState(30);

    const lobbyId = lobyId;
    

    useEffect(() => {
        // Listen for new words
        socket.on("newWord", ({ jumbledWord, currentRound, totalRounds, settings }) => {
            setJumbleWord(jumbledWord);
            setCurrentRound(currentRound);
            setTotalRounds(totalRounds);
            setTimer(settings.timeLimit);
        });

        socket.on("roundTimeout", ({ correctWord }) => {
            setNotification(`Time's up! The correct word was: ${correctWord}`);
        });

        /* socket.on("lobbyReset", () => {
            setCurrentRound(1);
            setTotalRounds(5);
            setJumbleWord("");
            setTimer(30);
            console.log("lobby reset caught2")
        }); */
        
        // Listen for incorrect guesses
        socket.on("incorrectGuess", ({ message }) => {
            setNotification(message);
        });

        return () => {
            socket.off("newWord");
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
            socket.emit("guess", { lobbyId, guess });
            console.log(lobbyId)
            console.log(guess)
            setGuess("");
            setNotification("");
        }
    };

    return (
        <div>
            <h2>Game Screen</h2>
            <p>Jumbled Word: <strong>{jumbleWord || "Waiting for game to start..."}</strong></p>
            <p>Time Left: {timer} seconds</p>
            <p>Round {currentRound} of {totalRounds}</p>
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
