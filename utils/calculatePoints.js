function calculatePoints(guess, difficulty, startTime) {
    const elapsedSeconds = (Date.now() - startTime) / 1000;
    const difficultyMultiplier = { easy: 1, medium: 2, hard: 3 };

    return Math.max(10 - elapsedSeconds, 1) * difficultyMultiplier[difficulty];
}

module.exports = calculatePoints;
