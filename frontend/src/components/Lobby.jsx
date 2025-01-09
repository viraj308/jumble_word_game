import React, { useState, useEffect } from "react";
import socket from "../socket";
import "./Lobby.css"

function Lobby({ onStart, setParentLobbyId, setGameStarted, setIsGameOver, setLobbyCreated, lobbyCreated, playerName, setPictureDisplay}) {
    /* const [playerName, setPlayerName] = useState(""); */
    const [lobbyId, setLobbyId] = useState("");
    const [players, setPlayers] = useState([]);
    const [settings, setSettings] = useState({
        wordLength: 5,
        timeLimit: 30,
        difficulty: "medium",
        rounds: 5, // Default number of rounds
    });
    const [isHost, setIsHost] = useState(false);
    /* const [lobbyCreated, setLobbyCreated] = useState(false); */

    const handleCreateLobby = () => {
      /*   if (!playerName) {
            alert("Please enter your name.");
            return;
        } */
        socket.emit("createLobby", { playerName });
        setLobbyCreated(true);
        setPictureDisplay(false)
    };

    const handleJoinLobby = () => {
        if (!lobbyId) {
            alert("Please enter a lobby ID.");
            return;
        }
        socket.emit("joinLobby", { lobbyId, playerName });
        setLobbyCreated(true);
        setPictureDisplay(false)
    };

    const handleUpdateSettings = () => {
        console.log("updateSettings")
        socket.emit("updateSettings", { lobbyId, settings });
    };

    const handleStartGame = () => {
        socket.emit("startGame", { lobbyId }); // Ensure lobbyId is correctly passed
        console.log("startGame event emitted with lobbyId:", lobbyId); // Debugging log
        /* setGameStarted(true)
        setIsGameOver(false) */
        
    };


    

    useEffect(() => {
        socket.on("lobbyUpdate", (lobby) => {
            setLobbyId(lobby.host);
            setPlayers(lobby.players);
            setSettings(lobby.settings);
            setIsHost(socket.id === lobby.host);
            setParentLobbyId(lobby.host);
            console.log("lobby Update caught")
        });

        socket.on("settingsUpdated", (updatedSettings) => {
            setSettings(updatedSettings);
            console.log(updatedSettings)
            console.log("lobby setting caught")
        });

        
        

        return () => {
            socket.off("lobbyUpdate");
            socket.off("settingsUpdated")
        };
    }, []);


    return (
        <div>
            {!lobbyCreated ? (
                <div>
                    <h2>Lobby</h2>
                   {/*  <input
                        type="text"
                        placeholder="Enter your name"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                    /> */}
                    <button onClick={handleCreateLobby}>Create Lobby</button>
                    <input
                        type="text"
                        placeholder="Enter Lobby ID"
                        value={lobbyId}
                        onChange={(e) => setLobbyId(e.target.value)}
                    />
                    <button onClick={handleJoinLobby}>Join Lobby</button>
                </div>
            ) : (
                <div>
                    <h2>Lobby ID: {lobbyId}</h2>
                    <h3>Players:</h3>
                    <ul>
                        {players.map((player) => (
                            <li key={player.id}>{player.name}</li>
                        ))}
                    </ul>
                    {isHost ? (
                        <div>
                            <h3>Game Settings</h3>
                            <label>
                                Word Length:
                                <input
                                    type="number"
                                    value={settings.wordLength}
                                    onChange={(e) =>
                                        setSettings({ ...settings, wordLength: parseInt(e.target.value) })
                                    }
                                />
                            </label>
                            <label>
                                Time Limit (seconds):
                                <input
                                    type="number"
                                    value={settings.timeLimit}
                                    onChange={(e) =>
                                        setSettings({ ...settings, timeLimit: e.target.value })
                                    }
                                />
                            </label>
                            <label>
                                Difficulty:
                                <select
                                    value={settings.difficulty}
                                    onChange={(e) =>
                                        setSettings({ ...settings, difficulty: e.target.value })
                                    }
                                >
                                    <option value="easy">Easy</option>
                                    <option value="medium">Medium</option>
                                    <option value="hard">Hard</option>
                                </select>
                            </label>
                            <label>
                                Number of Rounds:
                                <input
                                    type="number"
                                    value={settings.rounds}
                                    onChange={(e) =>
                                        setSettings({
                                            ...settings,
                                            rounds: parseInt(e.target.value) || 0,
                                        })
                                    }
                                />
                            </label>
                            
                            
                            <button onClick={handleUpdateSettings}>Update Settings</button>
                            <button onClick={handleStartGame}>Start Game</button>
                        </div>
                    ): <div> "waiting for the host to start the game ..." </div>}
                </div>
            )}
        </div>
    );
}

export default Lobby;
