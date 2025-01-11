import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Login from './components/Login';
import Game from './Game';

function App() {

    useEffect(() => {
        // Load the audio file
        const audio = new Audio('/click-2.mp3'); // Ensure the file is in the public folder

        // Function to handle button clicks
        const handleButtonClick = (event) => {
            if (event.target.tagName === 'BUTTON') {
                audio.currentTime = 0; // Reset audio playback for rapid clicks
                audio.play();
            }
        };

        // Attach the event listener
        document.addEventListener('click', handleButtonClick);

        // Cleanup the event listener on unmount
        return () => {
            document.removeEventListener('click', handleButtonClick);
        };
    }, []);

    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Game />} />
            </Routes>
        </Router>
    );
}

export default App;
