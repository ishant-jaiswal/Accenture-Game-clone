import React, { useEffect, useState } from "react";
import ScoreScreen from "../score/ScoreScreen.jsx";

const TOTAL_TIME = 300; // 10 seconds for testing
const PER_QUESTION_TIME = 15; // 5 seconds for testing
const TOTAL_QUESTIONS = 25; // 2 questions for testing

export default function BalloonGame() {
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [questionTime, setQuestionTime] = useState(PER_QUESTION_TIME);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [options, setOptions] = useState([]);
  const [picked, setPicked] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  // ---------------- MAIN TIMER ----------------
  useEffect(() => {
    if (timeLeft <= 0) {
      setGameOver(true);
      return;
    }
    const t = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft]);

  // ---------------- QUESTION TIMER ----------------
  useEffect(() => {
    if (questionTime <= 0) {
      nextQuestion();
      return;
    }
    const t = setInterval(() => setQuestionTime(t => t - 1), 1000);
    return () => clearInterval(t);
  }, [questionTime]);

  useEffect(() => {
    if (currentQuestion < TOTAL_QUESTIONS) {
      generateQuestion(currentQuestion + 1);
    } else {
      setGameOver(true);
    }
  }, [currentQuestion]);

  //---------------------------------------------
  function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function randomColor() {
    const colors = ["#ef4444", "#3b82f6", "#22c55e", "#eab308", "#8b5cf6"];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  function evaluate(exp) {
    return Function("return " + exp.replace("×", "*").replace("÷", "/"))();
  }

  function generateQuestion(level) {
    const PER_QUESTION_TIME = 15;
    const limit = 10 + level * 5;

    let expressions = [];

    // LEVEL 1–3 (Easy: integer + - ×)
    if (level <= 3) {
      expressions = [
        `${getRandom(1, limit)} + ${getRandom(1, limit)}`,
        `${getRandom(5, limit)} - ${getRandom(1, 5)}`,
        `${getRandom(2, 6 + level)} × ${getRandom(2, 6 + level)}`
      ];
    }

    // LEVEL 4–6 (Medium: add division + bigger numbers)
    else if (level <= 6) {
      const b1 = getRandom(2, 8 + level);
      const b2 = getRandom(2, 8 + level);

      expressions = [
        `${getRandom(10, limit)} + ${getRandom(5, limit)}`,
        `${getRandom(10, limit)} - ${getRandom(1, 10)}`,
        `${getRandom(3, 10)} × ${getRandom(3, 10)}`,
        `${b1 * b2} ÷ ${b1}` // clean division
      ];
    }

    // LEVEL 7+ (Hard: floating numbers + brackets + long expression)
    else {
      const a = (Math.random() * level * 2).toFixed(1);
      const b = (Math.random() * level).toFixed(1);
      const c = getRandom(2, limit);
      const d = getRandom(1, 10);

      expressions = [
        `(${a} + ${b}) × ${getRandom(2, 5)}`,
        `${getRandom(20, limit * 2)} ÷ ${getRandom(2, 9)}`,
        `${c} + ${d} × ${getRandom(2, 6)}`,
        `(${getRandom(10, 30)} - ${getRandom(1, 9)}) ÷ 2`
      ];
    }

    // Pick only 3 balloons per question
    expressions = expressions.sort(() => 0.5 - Math.random()).slice(0, 3);

    const balloons = expressions.map(exp => ({
      text: exp,
      value: Number(evaluate(exp).toFixed(2)), // rounding for floats
      color: randomColor()
    }));

    setOptions(shuffle([...balloons]));
    setPicked([]);
    setQuestionTime(PER_QUESTION_TIME);
  }


  function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
  }

  //---------------------------------------------
  function handleBalloonClick(balloon) {

    // STOP clicking more than 3
    if (picked.length === 3) return;

    // Already selected
    if (picked.find(b => b.text === balloon.text)) return;

    const newPicked = [...picked, balloon];
    setPicked(newPicked);

    if (newPicked.length === 3) {
      const userValues = newPicked.map(b => b.value);
      const sorted = [...userValues].sort((a, b) => a - b);

      const isCorrect =
        JSON.stringify(userValues) === JSON.stringify(sorted);

      // RIGHT ANSWER
      if (isCorrect) {
        setScore(prev => prev + 1);
      }

      // 🔥 ALWAYS MOVE TO NEXT QUESTION
      setTimeout(() => nextQuestion(), 600);
    }
  }


  function nextQuestion() {
    setCurrentQuestion(q => q + 1);
  }

  function format(sec) {
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}`;
  }

  //---------------------------------------------
  if (gameOver) {
    return (
      <ScoreScreen score={score} TOTAL_QUESTIONS={TOTAL_QUESTIONS} />
    );
  }

  //---------------------------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 to-indigo-100 p-4">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-5 font-bold">
        <p>Question {currentQuestion + 1} / {TOTAL_QUESTIONS}</p>
        <p>Score: {score}</p>
        <p>Time: {format(timeLeft)}</p>
        <button onClick={() => setGameOver(true)} className="bg-red-500 text-white px-2 py-1 rounded">Force End Game</button>
      </div>

      <h1 className="text-center text-2xl font-bold mb-2">
        Select balloons in <span className="text-blue-600">ascending</span> order
      </h1>

      <p className="text-center mb-4 text-red-600">
        {questionTime}s left for this question
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-4xl mx-auto mt-10">
        {options.map((balloon, i) => (
          <Balloon
            key={i}
            color={balloon.color}
            text={balloon.text}
            selected={picked.find(b => b.text === balloon.text)}
            onClick={() => handleBalloonClick(balloon)}
          />
        ))}
      </div>

    </div>
  );
}


function Balloon({ color, text, onClick, selected }) {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer flex justify-center animate-float transition-all 
      ${selected ? "scale-90 opacity-60" : "hover:scale-110"}`}
    >
      <div
        style={{ background: color }}
        className="w-36 h-44 rounded-full flex items-center justify-center shadow-2xl"
      >
        <span className="text-white font-bold text-2xl">
          {text}
        </span>
      </div>
    </div>
  );
}
