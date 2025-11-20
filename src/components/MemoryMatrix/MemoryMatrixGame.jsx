import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const TOTAL_LEVELS = 10;
const PER_LEVEL_TIME = 30; // seconds per level
const TOTAL_TIME = 300; // total seconds for the whole 10-level run

function gridSizeForLevel(level) {
  if (level <= 2) return 3;
  if (level <= 5) return 4;
  return 5;
}

function rndInt(max) {
  return Math.floor(Math.random() * max);
}

function posToKey(r, c) {
  return `${r},${c}`;
}

function buildGuaranteedPath(start, key, door) {
  const path = new Set();
  let r = start.r,
    c = start.c;
  path.add(posToKey(r, c));
  while (c !== key.c) {
    c += c < key.c ? 1 : -1;
    path.add(posToKey(r, c));
  }
  while (r !== key.r) {
    r += r < key.r ? 1 : -1;
    path.add(posToKey(r, c));
  }
  while (c !== door.c) {
    c += c < door.c ? 1 : -1;
    path.add(posToKey(r, c));
  }
  while (r !== door.r) {
    r += r < door.r ? 1 : -1;
    path.add(posToKey(r, c));
  }
  return path;
}

export default function MemoryMatrixGame() {
  const navigate = useNavigate();
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [totalTimeLeft, setTotalTimeLeft] = useState(TOTAL_TIME);
  const [levelTimeLeft, setLevelTimeLeft] = useState(PER_LEVEL_TIME);
  const [gameEnded, setGameEnded] = useState(false);

  const gridSize = useMemo(() => gridSizeForLevel(level), [level]);
  const totalCells = gridSize * gridSize;

  const startPos = { r: 0, c: 0 };
  const [player, setPlayer] = useState(startPos);
  const [foundKey, setFoundKey] = useState(false);

  // Generate key, door, and walls
  const { keyPos, doorPos, walls } = useMemo(() => {
    let keyIndex = rndInt(totalCells);
    let doorIndex = rndInt(totalCells);
    while (keyIndex === 0) keyIndex = rndInt(totalCells);
    while (doorIndex === 0 || doorIndex === keyIndex) doorIndex = rndInt(totalCells);

    const key = { r: Math.floor(keyIndex / gridSize), c: keyIndex % gridSize };
    const door = { r: Math.floor(doorIndex / gridSize), c: doorIndex % gridSize };

    const pathSet = buildGuaranteedPath(startPos, key, door);

    const maxWalls = Math.max(1, Math.min(totalCells - pathSet.size - 1, 3 + Math.floor(level / 2)));
    const wallSet = new Set();

    const attemptsLimit = totalCells * 4;
    let attempts = 0;
    while (wallSet.size < maxWalls && attempts < attemptsLimit) {
      attempts++;
      const idx = rndInt(totalCells);
      const r = Math.floor(idx / gridSize);
      const c = idx % gridSize;
      const keyStr = posToKey(r, c);
      if (keyStr === posToKey(startPos.r, startPos.c)) continue;
      if (keyStr === posToKey(key.r, key.c)) continue;
      if (keyStr === posToKey(door.r, door.c)) continue;
      if (pathSet.has(keyStr)) continue;
      wallSet.add(keyStr);
    }

    const wallsArray = [...wallSet].map((s) => {
      const [r, c] = s.split(",").map(Number);
      return { r, c };
    });

    return { keyPos: key, doorPos: door, walls: wallsArray };
  }, [level, gridSize, totalCells]);

  useEffect(() => {
    setPlayer(startPos);
    setFoundKey(false);
    setLevelTimeLeft(PER_LEVEL_TIME);
  }, [level, gridSize]);

  // TOTAL timer
  useEffect(() => {
    if (gameEnded) return;
    const t = setInterval(() => {
      setTotalTimeLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          setGameEnded(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [gameEnded]);

  // per-level timer
  useEffect(() => {
    if (gameEnded) return;
    const t = setInterval(() => {
      setLevelTimeLeft((s) => {
        if (s <= 1) {
          if (level < TOTAL_LEVELS) {
            setLevel((L) => L + 1);
            return PER_LEVEL_TIME;
          } else {
            setGameEnded(true);
            return 0;
          }
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [level, gameEnded]);

  if (totalTimeLeft <= 0) setGameEnded(true);

  const isWall = (r, c) => walls.some((w) => w.r === r && w.c === c);

  const move = (dr, dc) => {
    if (gameEnded) return;
    const nr = player.r + dr;
    const nc = player.c + dc;
    if (nr < 0 || nc < 0 || nr >= gridSize || nc >= gridSize) return;

    if (isWall(nr, nc)) {
      // hit invisible wall: reset to start
      setPlayer(startPos);
      return;
    }

    setPlayer({ r: nr, c: nc });

    if (!foundKey && nr === keyPos.r && nc === keyPos.c) {
      setFoundKey(true);
      setScore((s) => s + 10 * level);
    }

    if (foundKey && nr === doorPos.r && nc === doorPos.c) {
      setScore((s) => s + 20 * level);
      if (level < TOTAL_LEVELS) setLevel((L) => L + 1);
      else setGameEnded(true);
    }
  };

  const endGameEarly = () => setGameEnded(true);

  if (gameEnded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-indigo-900 text-white p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Game Finished</h2>
          <p className="mb-2">Final Score: {score}</p>
          <p className="mb-2">Reached Level: {level}/{TOTAL_LEVELS}</p>
          <button
            onClick={() => {
              setLevel(1);
              setScore(0);
              setTotalTimeLeft(TOTAL_TIME);
              setGameEnded(false);
            }}
            className="bg-emerald-500 px-4 py-2 rounded"
          >
            Play Again
          </button>
          <button className="bg-emerald-500 px-4 py-2 mx-2 rounded" onClick={()=>navigate("/")}>Exit</button>
        </div>
      </div>
    );
  }

  const formatTime = (s) => {
    const mm = Math.floor(s / 60).toString().padStart(2, "0");
    const ss = (s % 60).toString().padStart(2, "0");
    return `${mm}:${ss}`;
  };

  const renderCell = (r, c) => {
    if (player.r === r && player.c === c) return <span className="text-xl">🧍</span>;
    if (keyPos.r === r && keyPos.c === c) return <span className="text-xl">🔑</span>;
    if (doorPos.r === r && doorPos.c === c) return <span className="text-xl">🚪</span>;
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-purple-900 text-white p-4 flex flex-col items-center">
      {/* Header */}
      <header className="w-full max-w-3xl flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Memory Matrix</h1>
        <div className="flex gap-3 items-center">
          <div>Level: {level}/{TOTAL_LEVELS}</div>
          <div>Score: {score}</div>
          <div>Total: {formatTime(totalTimeLeft)}</div>
          <div>Level: {formatTime(levelTimeLeft)}</div>
          <button onClick={endGameEarly} className="ml-2 bg-red-600 hover:bg-red-700 px-3 py-1 rounded">
            End Game
          </button>
        </div>
      </header>

      <p className="mb-3 text-sm opacity-90">{foundKey ? "Key collected — go to door 🚪" : "Find the key 🔑 — walls are hidden"}</p>

      {/* Grid */}
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${gridSize}, 56px)` }}>
        {Array.from({ length: gridSize }).map((_, r) =>
          Array.from({ length: gridSize }).map((__, c) => (
            <div
              key={`${r}-${c}`}
              className="h-14 w-14 flex items-center justify-center rounded-md border bg-white/5 border-white/10"
            >
              {renderCell(r, c)}
            </div>
          ))
        )}
      </div>

      {/* Controls */}
      <div className="mt-6 grid grid-cols-3 gap-3 items-center">
        <div />
        <button onClick={() => move(-1, 0)} className="btn px-4 py-2 bg-indigo-600 rounded">⬆</button>
        <div />
        <button onClick={() => move(0, -1)} className="btn px-4 py-2 bg-indigo-600 rounded">⬅</button>
        <div />
        <button onClick={() => move(0, 1)} className="btn px-4 py-2 bg-indigo-600 rounded">➡</button>
        <div />
        <button onClick={() => move(1, 0)} className="btn px-4 py-2 bg-indigo-600 rounded">⬇</button>
        <div />
      </div>
    </div>
  );
}
