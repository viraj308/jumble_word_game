function jumbleWord(word) {
    return word.split("").sort(() => Math.random() - 0.5).join("");
}



module.exports = jumbleWord;
