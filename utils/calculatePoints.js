/* function calculatePoints(guess, difficulty, startTime) {
    const elapsedSeconds = (Date.now() - startTime) / 1000;
    const difficultyMultiplier = { easy: 1, medium: 2, hard: 3 };

    return Math.max(10 - elapsedSeconds, 1) * difficultyMultiplier[difficulty];
}

module.exports = calculatePoints; */
/* function calculatePoints(guess, startTime) {
    const elapsedSeconds = (Date.now() - startTime) / 1000;

    // Calculate points and round to the nearest integer
    const points = Math.max(10 - elapsedSeconds, 1);
    return Math.round(points); // Ensure no decimal places
}

module.exports = calculatePoints; */

function calculatePoints(guess, startTime) {
    const elapsedSeconds = (Date.now() - startTime) / 1000;

    // Calculate the points ensuring the result is at most 2 decimal places
    const points = Math.max(10 - elapsedSeconds, 1);
    return Math.round(points * 100) / 100; // Ensure at most 2 decimal places
}

module.exports = calculatePoints;



