import React, { useState, useEffect } from "react";
import socket from "../socket";

function Lobby({ onStart, setParentLobbyId }) {
    const [playerName, setPlayerName] = useState("");
    const [lobbyId, setLobbyId] = useState(""
    );
    const [players, setPlayers] = useState([]);
    const [settings, setSettings] = useState({
        wordLength: 5,
        timeLimit: 30,
        difficulty: "medium",
    });
    const [isHost, setIsHost] = useState(false);
    const [lobbyCreated, setLobbyCreated] = useState(false);

    const handleCreateLobby = () => {
        socket.emit("createLobby", { playerName });
        setLobbyCreated(true);
    };

    const handleJoinLobby = () => {
        socket.emit("joinLobby", { lobbyId, playerName });
        setLobbyCreated(true);
    };

    const handleUpdateSettings = () => {
        socket.emit("updateSettings", { lobbyId, settings });
    };

    const handleStartGame = () => {
        socket.emit("startGame", { lobbyId });
    };

    useEffect(() => {
        socket.on("lobbyUpdate", (lobby) => {
            setLobbyId(lobby.host);
            setPlayers(lobby.players);
            setSettings(lobby.settings);
            setIsHost(socket.id === lobby.host);

            setParentLobbyId(lobby.host);
        });

        /* socket.on("gameStarted", () => {
            console.log("The game has started")
            onStart(); // Transition to game screen
        }); */

        

        return () => {
            socket.off("lobbyUpdate");
            socket.off("gameStarted");
        };
    }, [onStart]);

    return (
        <div>
            {!lobbyCreated ? (
                <div>
                    <h2>Lobby</h2>
                    <input
                        type="text"
                        placeholder="Enter your name"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                    />
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
                    {isHost && (
                        <div>
                            <h3>Game Settings</h3>
                            <label>
                                Word Length:
                                <input
                                    type="number"
                                    value={settings.wordLength}
                                    onChange={(e) =>
                                        setSettings({ ...settings, wordLength: e.target.value })
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
                            <button onClick={handleUpdateSettings}>Update Settings</button>
                            <button onClick={handleStartGame}>Start Game</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default Lobby;
