import React, { useState, useEffect } from "react";
import socket from "../socket";

function Leaderboard() {
    const [players, setPlayers] = useState([]);

    useEffect(() => {
        // Listen for leaderboard updates
        socket.on("updateLeaderboard", (updatedPlayers) => {
            // Sort players by points (descending)
            const sortedPlayers = [...updatedPlayers].sort((a, b) => b.points - a.points);
            setPlayers(sortedPlayers);
        });

        return () => {
            socket.off("updateLeaderboard");
        };
    }, []);

    return (
        <div>
            <h2>Leaderboard</h2>
            <ol>
                {players.map((player) => (
                    <li key={player.id}>
                        {player.id} - {player.points} points
                    </li>
                ))}
            </ol>
        </div>
    );
}

export default Leaderboard;
