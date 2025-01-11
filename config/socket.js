const generateWord = require("../utils/wordGenerator")
const jumbleWord = require("../utils/jumbleWord")
const calculatePoints = require("../utils/calculatePoints")

let lobbies = {};

const setupSockets = (io) => {
    io.on("connection", (socket) => {
        console.log(`Player connected: ${socket.id}`);

        socket.on("updateSettings", ({ lobbyId, settings }) => {
            console.log("updateSetting event received")
            const lobby = lobbies[lobbyId];
            console.log(lobby)
            if (!lobby) return;
    
            // Update lobby settings
            lobby.settings = { ...lobby.settings, ...settings };
    
            // Broadcast updated settings to all players in the lobby
            io.to(lobbyId).emit("settingsUpdated", lobby.settings);
    
            console.log(`Settings updated for lobby ${lobbyId}:`, lobby.settings);
        });
    

        socket.on("createLobby", ({ playerName }) => {
            const lobbyId = socket.id; // Use host's socket ID as the lobby ID
            lobbies[lobbyId] = {
                id: socket.id,
                host: socket.id,
                players: [{ id: socket.id, name: playerName }],
                settings: {
                    /* wordLength: 5, */
                    timeLimit: 30,
                    difficulty: "medium",
                    rounds: 2,
                },
                gameState: {}
            };
            console.log(lobbies);
            socket.join(lobbyId);
            io.to(lobbyId).emit("lobbyUpdate", lobbies[lobbyId]);
        });

        socket.on("joinLobby", ({ lobbyId, playerName }) => {
            const lobby = lobbies[lobbyId];
            if (lobbies[lobbyId]) {
                /* lobbies[lobbyId].players.push({ id: socket.id }); */
                lobbies[lobbyId].players.push({ id: socket.id, name: playerName });
                console.log(lobbies)
                console.log(lobby.players)
                socket.join(lobbyId);
                io.to(lobbyId).emit("lobbyUpdate", lobbies[lobbyId]);

                } else {
                    socket.emit("error", { message: "Lobby does not exist." });
                    console.log("error joining")
                }
        });

        // Start game event
        socket.on("startGame", (data) => {
            const { lobbyId } = data;
            const lobby = lobbies[lobbyId];
        
           
            console.log(lobby)
            

            // Store the game state
            lobby.gameState = {
                correctWord: "",
                jumbledWord: "",
                leaderboard: [],
                currentRound: 0,
                startTime: 0,
                roundTimer: 0,
            };

            // Notify players about the updated leaderboard
            io.to(lobbyId).emit("leaderboardUpdate", lobby.gameState.leaderboard);

            console.log(lobbies)
            

            // Start the first round
            startRound(lobbyId);

        });

        function startRound(lobbyId) {
            const lobby = lobbies[lobbyId];
            if (!lobby) return;

            // Clear any active round timer
            if (lobby.gameState.roundTimer) {
                clearTimeout(lobby.gameState.roundTimer);
                lobby.gameState.roundTimer = null;
            }
        
            // Check if all rounds are completed
            if (lobby.gameState.currentRound >= lobby.settings.rounds) {
                io.to(lobbyId).emit("gameOver");
                return;
            }
        
            // Increment the round counter
            lobby.gameState.currentRound++; 

            // Use settings from the lobby
            const { difficulty } = lobby.settings;
            console.log(difficulty)
            const difficultyString = difficulty.toString()
        
            // Generate word and jumble
            const correctWord = generateWord(difficultyString); // Implement based on settings
            console.log(correctWord)
            const jumbledWord = jumbleWord(correctWord);
            console.log(jumbledWord)
        
            // Update the game state
            lobby.gameState.correctWord = correctWord;
            lobby.gameState.jumbledWord = jumbledWord;
            lobby.gameState.startTime = Date.now();

            const settings = lobby.settings
        
            // Broadcast the new word and current round
            io.to(lobbyId).emit("newWord", {
                jumbledWord,
                currentRound: lobby.gameState.currentRound,
                totalRounds: lobby.settings.rounds,
                settings: settings,
                lobby: lobby,
            });

            console.log("new word event emitted for lobby:", lobbyId);
        
            // Start the timer
            /* setTimeout(() => {
                // If the round hasn't been won yet, end it and start the next
                if (lobby.gameState.correctWord === correctWord) {
                    io.to(lobbyId).emit("roundTimeout", { correctWord: correctWord });
                    startRound(lobbyId);
                }
            }, lobby.settings.timeLimit * 1000); */

            // Start the timer for the current round
            lobby.gameState.roundTimer = setTimeout(() => {
                // If the round hasn't been won yet, emit a timeout event and move to the next round
                if (lobby.gameState.correctWord === correctWord) {
                    io.to(lobbyId).emit("roundTimeout", { correctWord });
                    startRound(lobbyId);

                    } 
                }
            , lobby.settings.timeLimit * 1000);





        }

        // Handle the "guess" event
        socket.on("guess", ({ lobbyId, guess, playerName }) => {
            const lobby = lobbies[lobbyId];

            if (!lobby || !lobby.gameState) {
                socket.emit("error", { message: "Game is not active in this lobby." });
                return;
            }

            const { correctWord, leaderboard } = lobby.gameState;

            // Check if the guess is correct
            if (guess.toLowerCase() === correctWord.toLowerCase()) {
                // Find the player in the leaderboard or add them
                let player = leaderboard.find((p) => p.id === socket.id);
                if (!player) {
                    player = { id: socket.id, name: playerName, points: 0 };
                    leaderboard.push(player);
                }

               /*  // Update the player's points
                const points = calculatePoints(guess, lobby.settings.difficulty, lobby.gameState.startTime);
                player.points += points; */
                // Update the player's points
                let points = calculatePoints(guess, lobby.settings.difficulty, lobby.gameState.startTime);
                points = parseFloat(points.toFixed(2)); // Ensure two digits after the decimal
                player.points += points;


                // Sort the leaderboard by points
                leaderboard.sort((a, b) => b.points - a.points);

                // Notify players about the updated leaderboard
                io.to(lobbyId).emit("leaderboardUpdate", leaderboard);

                console.log(lobbies)
                console.log(lobby.gameState.leaderboard)

                // Move to the next round
                startRound(lobbyId);
            } else {
                // Notify the player if their guess was incorrect
                socket.emit("incorrectGuess", { message: "Incorrect guess. Try again!" });
            }
        });

        socket.on("resetGame", ({lobyId}) => {
        
            const lobby = lobbies[lobyId];
            console.log("reset")
            console.log(lobyId);
            console.log(lobbies)
            console.log(lobby)
            if (!lobby || lobby.host !== socket.id) {
                socket.emit("error", { message: "Only the host can reset the game." });
                return;
            }
        
            resetLobby(lobyId);
        });

        function resetLobby(lobbyId) {
            const lobby = lobbies[lobbyId];
            if (!lobby) return;
        
            lobby.gameState = {
                leaderboard: [],
                correctWord: "",
                jumbledWord: "",
                currentRound: 0,
                startTime: 0,
            };
            console.log(lobby)

            io.to(lobbyId).emit("lobbyReset");
            console.log("Lobby reset emitted");

            setTimeout(() => {
            io.to(lobbyId).emit("lobbyUpdate", lobby);
            console.log("Lobby update emitted:", lobby);
            }, 100); // Delay of 100ms


            
            
        }
        


         // Disconnect
        socket.on("disconnect", () => {
            console.log(`Player disconnected: ${socket.id}`);
        
            // Iterate through all lobbies to clean up the disconnected player
            for (const lobbyId in lobbies) {
                // Remove the disconnected player from the lobby
                lobbies[lobbyId].players = lobbies[lobbyId].players.filter(
                    (player) => player.id !== socket.id
                );
        
                // If the lobby is empty, delete it
                if (lobbies[lobbyId].players.length === 0) {
                    delete lobbies[lobbyId];
                } else {
                    // If the disconnected player was the host, reassign the host
                    if (lobbies[lobbyId].host === socket.id) {
                        // Assign the new host (first player in the list)
                        lobbies[lobbyId].host = lobbies[lobbyId].players[0].id;
                        console.log("New host assigned:", lobbies[lobbyId].host);
                        console.log(lobbies)
                        console.log(lobbies[lobbyId])
                    }
                    // Emit the updated lobby data to all remaining players in the lobby
                    io.to(lobbyId).emit("lobbyUpdate", lobbies[lobbyId]);
                }
            }
        }); 
        
        process.on("uncaughtException", (err) => {
            console.error("Unhandled Exception:", err);
        });
        
        process.on("unhandledRejection", (reason, promise) => {
            console.error("Unhandled Rejection at:", promise, "reason:", reason);
        });
        

        
        
    });
};

module.exports = { setupSockets };
