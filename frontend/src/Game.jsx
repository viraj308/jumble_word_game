import React, { useEffect, useState } from "react";
import socket from "./socket"
import './Game.css'
import GameScreen from "./components/GameScreen";
import Leaderboard from "./components/Leaderboard";
import Lobby from "./components/Lobby";

import { AudioPlayer } from "../utils/audioUtils";

import { useNavigate } from 'react-router-dom';


function Game() {

   const [gameStarted, setGameStarted] = useState(false);
   const [isGameOver, setIsGameOver] = useState(false);
   const [lobbyCreated, setLobbyCreated] = useState(false); // State in App to track lobby creation
   const [isHost1, setIsHost1] = useState(false)

   const [lobbyMusic, setLobbyMusic] = useState(null);
   const [gameMusic, setGameMusic] = useState(null);
   const [volume, setVolume] = useState(0.5); // Default volume (50%)


   const [userProfile, setUserProfile] = useState(null);

   const [lobyId, setParentLobbyId] = useState(null);
   const [jumbledWord, setJumbledWord] = useState("");
   const [currentRound, setCurrentRound] = useState(1);
   const [totalRounds, setTotalRounds] = useState(5);
   const [timer, setTimer] = useState(30); 

   const [leaderboard, setLeaderboard] = useState([]); // State to hold the leaderboard
   const [settings, setSettings] = useState({})

   const [pictureDisplay, setPictureDisplay] = useState(true)

   const navigate = useNavigate();

   const [isLoading, setIsLoading] = useState(true); // Add loading state
   
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
    socket.on("playerLeft", ({ playerId, lobby }) => {
        console.log(`Player ${playerId} of ${lobby} left the game`);
        // Update the client-side UI based on new lobby state
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


     useEffect(() => {
        fetch("http://localhost:5000/profile", {
            method: "GET",
            credentials: "include", // Include cookies with the request
        })
            .then((response) => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error("Unauthorized");
                }
            })
            .then((data) => {
                console.log("Profile Data:", data);
                setUserProfile(data);
            })
            .catch((error) => {
                console.error("Error fetching profile:", error);
                navigate("/login")
            })
            .finally(() => {
                setIsLoading(false)
            })
    }, []);


    useEffect(() => {
        // Update volume for both music tracks
        if (lobbyMusic) lobbyMusic.setVolume(volume);
        if (gameMusic) gameMusic.setVolume(volume);
    }, [volume, lobbyMusic, gameMusic]);
    


     
    


    


  
   /* const handleLogout = () => {
        window.location.href = "http://localhost:5000/auth/logout"; // Call the logout route
    }; */

    const handleResetGame = () => {
        socket.emit("resetGame", {lobyId});
        /* setGameStarted(false); */
        setLeaderboard([]);
        gameMusic.stop();
        lobbyMusic.play();
        
    };

    // Initialize music players
         const lobbyTrack = new AudioPlayer('/lobby-music.mp3'); // Place in the public folder
         const gameTrack = new AudioPlayer('/game-music.mp3'); // Place in the public folder

    const handleMusicOnStart = () => {
         
         setLobbyMusic(lobbyTrack);
         setGameMusic(gameTrack);
 
         // Play lobby music on mount
         lobbyTrack.setVolume(volume);
         lobbyTrack.play();
         gameMusic.stop();
    }

    const handleMusicOnGameStart = () => {
          // Stop lobby music and start game music
        lobbyMusic.stop();
        gameMusic.play();
    }

    // Main Game screen, Lobby, etc.
   if (!userProfile) {
    return <p>hello, user profile not received</p>; // Or show a loading state
    }

    if (isLoading) {
        return <p>Loading...</p>; // Show loading while fetching profile
    }

  return (
    <div className="game-container">
      {pictureDisplay && userProfile && (
                <div className="profile-container">
                    <img 
                        src={userProfile.image} 
                        alt="User Avatar" 
                        className="profile-picture" 
                    />
                    <h2 className="profile-name">{userProfile.name}</h2>
                  
                </div>
                
            )}
              <div className="volume-slider">
                        <label>Volume: {Math.round(volume * 100)}%</label>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={volume}
                            onChange={(e) => setVolume(Number(e.target.value))}
                        />
                    </div>


            <h1>Jumbled Word Game</h1>
            
      <div>
            {!gameStarted ? (
                <Lobby setParentLobbyId={setParentLobbyId} setGameStarted={setGameStarted} setIsGameOver={setIsGameOver} setLobbyCreated={setLobbyCreated} lobbyCreated={lobbyCreated}  playerName={userProfile.name} 
                setPictureDisplay={setPictureDisplay} gameMusic={gameMusic} handleMusicOnStart={handleMusicOnStart} handleMusicOnGameStart={handleMusicOnGameStart}/>
            ) : (
                <>
                    {!isGameOver ? (<div><GameScreen lobyId={lobyId} jumbledWord={jumbledWord} timer={timer} setTimer={setTimer} currentRound={currentRound} totalRounds={totalRounds} settings={settings} playerName={userProfile.name}/>
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

    </div>
  )
}

export default Game
