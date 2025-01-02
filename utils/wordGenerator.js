const easyWords = ["cat", "dog", "bat", "rat"];
const mediumWords = ["table", "apple", "chair", "grape"];
const hardWords = ["complex", "journey", "mystery", "universe"];

function generateWord(length, difficulty) {
    let wordList;

    if (difficulty === "easy") wordList = easyWords;
    else if (difficulty === "medium") wordList = mediumWords;
    else if (difficulty === "hard") wordList = hardWords;

    // Filter words by length
    const filteredWords = wordList.filter((word) => word.length === length);
    return filteredWords[Math.floor(Math.random() * filteredWords.length)];
}

module.exports = generateWord;
