/* function jumbleWord(word) {
    return word.split("").sort(() => Math.random() - 0.5).join("");
}



module.exports = jumbleWord; */
function jumbleWord(word) {
    const arr = word.split("");
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]]; // Swap elements
    }
    return arr.join("");
}

module.exports = jumbleWord;
