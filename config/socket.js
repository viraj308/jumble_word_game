const generateWord = require("../utils/wordGenerator")
const jumbleWord = require("../utils/jumbleWord")
const calculatePoints = require("../utils/calculatePoints")

let correctWord = "";
let leaderboard = [];
let lobbies = {};

const setupSockets = (io) => {
    io.on("connection", (socket) => {
        console.log(`Player connected: ${socket.id}`);

        socket.on("createLobby", ({ playerName }) => {
            const lobbyId = socket.id; // Use host's socket ID as the lobby ID
            lobbies[lobbyId] = {
                host: socket.id,
                players: [{ id: socket.id, name: playerName }],
                settings: {
                    wordLength: 5,
                    timeLimit: 30,
                    difficulty: "medium",
                },
            };
            console.log(lobbies);
            socket.join(lobbyId);
            io.to(lobbyId).emit("lobbyUpdate", lobbies[lobbyId]);
        });

        socket.on("joinLobby", ({ lobbyId, playerName }) => {
            const lobby = lobbies[lobbyId];
            if (lobbies[lobbyId]) {
                lobbies[lobbyId].players.push({ id: socket.id, name: playerName });
                console.log(lobbies)
                socket.join(lobbyId);
                io.to(lobbyId).emit("lobbyUpdate", lobbies[lobbyId]);

                 // Send the current game state to the new player
    if (lobby.gameState) {
        socket.emit("newWord", { jumbledWord: lobby.gameState.jumbledWord, settings: lobby.settings });
    } else {
        socket.emit("waiting", { message: "Waiting for game to start." });
    }
            } else {
                socket.emit("error", { message: "Lobby does not exist." });
                console.log("error joining")
            }
        });

        // Start game event
        socket.on("startGame", ({ lobbyId }) => {
            const lobby = lobbies[lobbyId];
            if (!lobby || lobby.host !== socket.id) {
                socket.emit("error", { message: "You are not authorized to start the game." });
                return;
            }
        
            // Use settings from the lobby
            const { wordLength, difficulty } = lobby.settings;
            console.log(wordLength, difficulty)
            const difficultyString = difficulty.toString()
        
            // Generate word and jumble
            const correctWord = generateWord(wordLength, difficultyString); // Implement based on settings
            console.log(correctWord)
            const jumbledWord = jumbleWord(correctWord);
            console.log(jumbledWord)
        
            // Store the game state
            lobby.gameState = {
                correctWord,
                jumbledWord,
                leaderboard: [],
                startTime: Date.now(),
            };
            console.log(lobbies)
            console.log("hi")

            
            

            // Notify the lobby players about the new game
            io.to(lobbyId).emit("newWord", { jumbledWord, settings: lobby.settings });

            // Notify all players in the lobby that the game has started
            /* io.to(lobbyId).emit("gameStarted"); */

           
        

        });

        // Handle the "guess" event
socket.on("guess", ({ lobbyId, guess }) => {
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
            player = { id: socket.id, /* name: players[socket.id]?.name || "Anonymous", */ points: 0 };
            leaderboard.push(player);
        }

        // Update the player's points
        const points = calculatePoints(guess, lobby.settings.difficulty, lobby.gameState.startTime);
        player.points += points;

        // Sort the leaderboard by points
        leaderboard.sort((a, b) => b.points - a.points);

        // Notify players about the updated leaderboard
        io.to(lobbyId).emit("leaderboardUpdate", leaderboard);

        // Generate a new word and broadcast it
        /* const newWord = generateWord(lobby.settings.wordLength, lobby.settings.difficulty);
        const jumbledWord = jumbleWord(newWord);
        console.log(lobbies) */

        // Use settings from the lobby
        const { wordLength, difficulty } = lobby.settings;
        console.log(wordLength, difficulty)
        const difficultyString = difficulty.toString()
    
        // Generate word and jumble
        const newWord = generateWord(wordLength, difficultyString); // Implement based on settings
        const jumbledWord = jumbleWord(newWord);
        

        // Update game state
        lobby.gameState.correctWord = newWord;
        lobby.gameState.jumbledWord = jumbledWord;
        lobby.gameState.startTime = Date.now();

        console.log(lobbies)
        console.log(lobby.gameState.leaderboard)

        io.to(lobbyId).emit("newWord", { jumbledWord, settings: lobby.settings });
    } else {
        // Notify the player if their guess was incorrect
        socket.emit("guessFeedback", { correct: false, message: "Incorrect guess. Try again!" });
    }
});


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
                    }
                    // Emit the updated lobby data to all remaining players in the lobby
                    io.to(lobbyId).emit("lobbyUpdate", lobbies[lobbyId]);
                }
            }
        });
        
    });
};

module.exports = { setupSockets };
