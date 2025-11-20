import React from "react";
import { useNavigate } from "react-router-dom";

export default function MemoryMatrixHome() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-indigo-500 to-purple-700 text-white">
      <h1 className="text-4xl font-bold mb-6">🧠 Memory Matrix</h1>

      <p className="mb-6 text-center max-w-md">
        Find the <span className="text-yellow-300">Key 🔑</span> and then reach
        the <span className="text-green-300">Exit 🚪</span>.  
        Walls are invisible. If you hit one, you return to start!
      </p>

      <button
        onClick={()=>navigate("/memory/game")}
        className="bg-white text-purple-700 px-8 py-3 rounded-xl font-bold hover:scale-105 transition"
      >
        Start Game
      </button>
    </div>
  );
}

