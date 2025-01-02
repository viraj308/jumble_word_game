import React from "react";
import "./Leaderboard.css"; // Optional: Add your styling here

const Leaderboard = ({ leaderboard }) => {
    return (
        <div className="leaderboard-container">
            <h2 className="leaderboard-title">Leaderboard</h2>
            <ul className="leaderboard-list">
                {leaderboard.map((player, index) => (
                    <li key={player.id} className="leaderboard-item">
                        <span className="player-rank">#{index + 1}</span>
                        <span className="player-name">{player.id}</span>
                        <span className="player-points">{player.points} pts</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Leaderboard;
