import React from "react";
import { useNavigate } from "react-router-dom";


export default function ScoreScreen({ score, TOTAL_QUESTIONS }) {
    const navigate = useNavigate();
    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
            <div className="p-10 bg-slate-900 rounded-xl shadow-lg w-[350px] text-center">
                <h1 className="text-3xl font-bold mb-4">Test Completed</h1>
                <p className="text-xl mb-2">Your Score</p>
                <p className="text-5xl font-bold text-green-400">{score} / {TOTAL_QUESTIONS}</p>
                <button
                    className="mt-6 bg-blue-600 px-6 py-2 rounded-lg"
                    onClick={() => navigate("/")}
                >
                    Restart
                </button>
            </div>
        </div>
    );
}