export class AudioPlayer {
    constructor(src) {
        this.audio = new Audio(src);
        this.audio.loop = true; // Ensure the music loops
    }

    play() {
        this.audio.play().catch((err) => console.error("Audio play error:", err));
    }

    pause() {
        this.audio.pause();
    }

    stop() {
        this.audio.pause();
        this.audio.currentTime = 0; // Reset to the beginning
    }

    setVolume(volume) {
        this.audio.volume = volume; // Volume range: 0.0 to 1.0
    }
}
