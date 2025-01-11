const fs = require('fs');

let wordData = JSON.parse(fs.readFileSync('utils/words.json', 'utf-8'));

function generateWord(difficulty) {
    const wordList = wordData[difficulty];
    if (!wordList) throw new Error("Invalid difficulty level");
    
    return wordList[Math.floor(Math.random() * wordList.length)];
}


module.exports = generateWord;
