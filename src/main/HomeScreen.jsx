import React from "react"
import { useNavigate } from "react-router-dom"

export default function HomeScreen() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-600 to-indigo-700 text-white p-6">
      <h1 className="text-4xl md:text-5xl font-bold mb-4">Accenture Gaming Round</h1>
      <p className="mb-10 text-center max-w-xl text-white/90">
        Choose any game to start your assessment. Each game checks a different skill: logic, memory and attention.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">

        <button
          onClick={() => navigate("/balloon")}
          className="p-6 rounded-2xl bg-white/90 text-gray-800 hover:scale-105 transition shadow-xl">
          🎈 <h2 className="text-xl font-bold">Math Balloon</h2>
          <p className="text-sm mt-2">Sort numbers in ascending order</p>
        </button>

        <button
          onClick={() => navigate("/hidden")}
          className="p-6 rounded-2xl bg-white/90 text-gray-800 hover:scale-105 transition shadow-xl">
          🔑 <h2 className="text-xl font-bold">Hidden Path</h2>
          <p className="text-sm mt-2">Find key and reach exit</p>
        </button>

        <button
          onClick={() => navigate("/memory")}
          className="p-6 rounded-2xl bg-white/90 text-gray-800 hover:scale-105 transition shadow-xl">
          🧠 <h2 className="text-xl font-bold">Memory Matrix</h2>
          <p className="text-sm mt-2">Remember & repeat pattern</p>
        </button>

      </div>
    </div>
  )
}
