import React from "react";
import { useNavigate } from "react-router-dom";

export default function HiddenPathHome() {
    const navigate = useNavigate();
  return (
    <div className="w-full h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white shadow-xl rounded-2xl p-10 w-[420px] animate-fadeIn">
        
        {/* Game Logo */}
        <div className="w-full flex flex-col items-center mb-6">
          <div className="w-20 h-20 bg-gray-800 rounded-xl flex items-center justify-center">
            <span className="text-white text-3xl font-bold">▶</span>
          </div>
          <h1 className="text-3xl font-bold mt-4 text-gray-800">
            Arrow Path Puzzle
          </h1>
          <p className="text-gray-500 mt-1">Build the correct path to win!</p>
        </div>

        {/* Middle Preview Box */}
        <div className="border-2 border-gray-300 rounded-xl h-48 mb-6 bg-gray-50 flex items-center justify-center">
          <p className="text-gray-400 text-lg">Puzzle Preview</p>
        </div>

        {/* Start Button */}
        <button
          onClick={() => navigate("/hidden/game")}
          className="w-full py-3 bg-blue-600 text-white text-lg font-semibold rounded-xl
          hover:bg-blue-700 transition-all duration-300 active:scale-95 shadow-md"
        >
          Start Game
        </button>
      </div>
    </div>
  );
}
