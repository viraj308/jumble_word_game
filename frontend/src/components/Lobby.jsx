import React, { useState } from "react";

function Lobby() {
    const [gameSettings, setGameSettings] = useState({
        wordLength: 5,
        timeLimit: 30,
        complexity: "medium"
    });

    const handleSettingChange = (e) => {
        const { name, value } = e.target;
        setGameSettings({ ...gameSettings, [name]: value });
    };

    return (
        <div>
            <h2>Game Lobby</h2>
            <label>
                Word Length:
                <input
                    type="number"
                    name="wordLength"
                    value={gameSettings.wordLength}
                    onChange={handleSettingChange}
                />
            </label>
            <label>
                Time Limit:
                <input
                    type="number"
                    name="timeLimit"
                    value={gameSettings.timeLimit}
                    onChange={handleSettingChange}
                />
            </label>
            <label>
                Complexity:
                <select
                    name="complexity"
                    value={gameSettings.complexity}
                    onChange={handleSettingChange}
                >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                </select>
            </label>
            <button>Start Game</button>
        </div>
    );
}

export default Lobby;
