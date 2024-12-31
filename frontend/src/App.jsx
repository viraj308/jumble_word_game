import React, { useEffect } from "react";
import { io } from "socket.io-client";
import './App.css'

const socket = io("http://localhost:5000");

function App() {
  useEffect(() => {
    socket.on("connect", () => {
        console.log(`Connected with ID: ${socket.id}`);
    });

    socket.on("disconnect", () => {
        console.log("Disconnected");
    });

    return () => socket.disconnect(); // Clean up on unmount
}, []);

   const handleLogin = () => {
        window.location.href = "http://localhost:5000/auth/google";
    };

  
   const handleLogout = () => {
        window.location.href = "http://localhost:5000/auth/logout"; // Call the logout route
    };
  

  return (
    <>
      <h1>Jumbled Word Game</h1>
      <button onClick={handleLogin}>Login with Google</button>

      <button onClick={handleLogout} className="logout-button">
            Logout
      </button>
    </>
  )
}

export default App
