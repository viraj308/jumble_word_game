import React, { useEffect, useState } from "react";
import socket from "./socket"
import './App.css'
import GameScreen from "./components/GameScreen";
import Leaderboard from "./components/Leaderboard";
import Lobby from "./components/Lobby";


function App() {

   const [gameStarted, setGameStarted] = useState(false);
   const [isGameOver, setIsGameOver] = useState(false);
   const [lobbyCreated, setLobbyCreated] = useState(false); // State in App to track lobby creation
   const [isHost1, setIsHost1] = useState(false)

   const [lobyId, setParentLobbyId] = useState(null);
   const [jumbledWord, setJumbledWord] = useState("");
   const [currentRound, setCurrentRound] = useState(1);
   const [totalRounds, setTotalRounds] = useState(5);
   const [timer, setTimer] = useState(30); 

   const [leaderboard, setLeaderboard] = useState([]); // State to hold the leaderboard
   const [settings, setSettings] = useState({})
   
  useEffect(() => {
    socket.on("connect", () => {
        console.log(`Connected with ID: ${socket.id}`);
    });

    socket.on("newWord", ({ jumbledWord, settings, currentRound, totalRounds, lobby }) => {
        console.log("newWord event received with:", { jumbledWord, settings });
        setIsGameOver(false);
        setGameStarted(true); // Switch to the game screen
        setJumbledWord(jumbledWord);
        setCurrentRound(currentRound);
        setTotalRounds(totalRounds);
        setTimer(settings.timeLimit);
        setSettings(settings);
        setIsHost1(socket.id === lobby.host);
    });

    socket.on("gameOver", () => {
        setIsGameOver(true);
    });


    socket.on("leaderboardUpdate", (updatedLeaderboard) => {
        setLeaderboard(updatedLeaderboard); // Update the leaderboard
    });

    socket.on("disconnect", () => {
        console.log("Disconnected");
    });

    socket.on("lobbyReset", () => {
        console.log("lobby reset for everyone")
        setGameStarted(false)
        setLobbyCreated(true)

    });

    
    return () => {
        // Cleanup listeners when the component unmounts
        socket.off("newWord");
        socket.off("leaderboardUpdate");
        socket.off("connect");
        socket.off("disconnect");
        socket.off("gameOver");
        socket.off("lobbyReset")
        
    };
}, []);



   const handleLogin = () => {
        window.location.href = "http://localhost:5000/auth/google";
    };

  
   const handleLogout = () => {
        window.location.href = "http://localhost:5000/auth/logout"; // Call the logout route
    };

    const handleResetGame = () => {
        socket.emit("resetGame", {lobyId});
        /* setGameStarted(false); */
        setLeaderboard([]);
        
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
                <Lobby setParentLobbyId={setParentLobbyId} setGameStarted={setGameStarted} setIsGameOver={setIsGameOver} setLobbyCreated={setLobbyCreated} lobbyCreated={lobbyCreated}/>
            ) : (
                <>
                    {!isGameOver ? (<div><GameScreen lobyId={lobyId} jumbledWord={jumbledWord} timer={timer} setTimer={setTimer} currentRound={currentRound} totalRounds={totalRounds}/>
                    <Leaderboard leaderboard={leaderboard} /> </div>)
                   
                    : (<div>
                        <h1>Game Over!</h1>
                        <Leaderboard leaderboard={leaderboard} /> 
                        {isHost1 ? ( <button onClick={handleResetGame}>Reset Game</button>)
                    : <p>waiting for host to start the game ...</p>    
                    }
                         </div>)
                         }
                </>
            )}
        </div>

    </>
  )
}

export default App
