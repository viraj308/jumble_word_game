import React, { useEffect, useState } from "react";
import socket from "./socket"
import './App.css'
import GameScreen from "./components/GameScreen";
import Leaderboard from "./components/Leaderboard";
import Lobby from "./components/Lobby";


function App() {

   const [gameStarted, setGameStarted] = useState(false);
   const [lobyId, setParentLobbyId] = useState(null);
   const [jumbledWord, setJumbledWord] = useState("");
   const [leaderboard, setLeaderboard] = useState([]); // State to hold the leaderboard
   const [settings, setSettings] = useState({})
   
  useEffect(() => {
    socket.on("connect", () => {
        console.log(`Connected with ID: ${socket.id}`);
    });

    socket.on("newWord", ({ jumbledWord, settings }) => {
        console.log("newWord event received with:", { jumbledWord, settings });
        setGameStarted(true); // Switch to the game screen
        setJumbledWord(jumbledWord);
        setSettings(settings);
    });

    socket.on("leaderboardUpdate", (updatedLeaderboard) => {
        setLeaderboard(updatedLeaderboard); // Update the leaderboard
    });

    socket.on("disconnect", () => {
        console.log("Disconnected");
    });


    return () => {
        // Cleanup listeners when the component unmounts
        socket.off("newWord");
        socket.off("leaderboardUpdate");
        socket.off("connect");
        socket.off("disconnect");
        
    };
}, []);

   

   const handleLogin = () => {
        window.location.href = "http://localhost:5000/auth/google";
    };

  
   const handleLogout = () => {
        window.location.href = "http://localhost:5000/auth/logout"; // Call the logout route
    };
  

  return (
    <>
      <h1>Jumbled Word Game</h1>
      <button onClick={handleLogin}>Login with Google</button>

      <button onClick={handleLogout} className="logout-button">
            Logout
      </button>
      <div>
            {!gameStarted ? (
                <Lobby onStart={() => socket.emit("startGame", { lobyId })} setParentLobbyId={setParentLobbyId}/>
            ) : (
                <>
                    <GameScreen lobyId={lobyId} jumbledWord={jumbledWord}/>
                    {/* Display the leaderboard while the game is in progress */}
                    <Leaderboard leaderboard={leaderboard} />
                </>
            )}
        </div>

    </>
  )
}

export default App
