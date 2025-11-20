// ExactGridPathGameWithFlow.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
/**
 * ExactGridPathGameWithFlow
 * - Flow animation on solved path (Option C)
 * - Zoom out -> Zoom in transition to next level (Option 3)
 * - Uses uploaded screenshot as faint background: /mnt/data/Screenshot 2025-11-21 025101.png
 *
 * Paste into a React project that has Tailwind available.
 */

// Directions: 0=up,1=right,2=down,3=left
const DIRS = [
  { r: -1, c: 0 },
  { r: 0, c: 1 },
  { r: 1, c: 0 },
  { r: 0, c: -1 },
];

const TILE_DEFS = {
  empty: [],
  line: [1, 3],
  curve: [1, 2],
  tee: [0, 1, 3],
  cross: [0, 1, 2, 3],
  start: [1],
  end: [3],
};

function rotateOpenings(openings, k) {
  return openings.map((d) => (d + k + 4) % 4);
}
function getOpposite(d) {
  return (d + 2) % 4;
}

function getGridSizeForLevel(index) {
  const lvl = index + 1;
  if (lvl <= 3) return 5;
  if (lvl <= 5) return 6;
  if (lvl <= 8) return 7;
  return 8;
}

// Generate a guaranteed path and initial puzzle by random-rotating solved layout
function generateSolvedGrid(rows, cols) {
  const start = { r: 0, c: 0 };
  const end = { r: 0, c: cols - 1 };

  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  const path = [];
  function push(p) {
    path.push(p);
    visited[p.r][p.c] = true;
  }
  push(start);

  while (!(path[path.length - 1].r === end.r && path[path.length - 1].c === end.c)) {
    const cur = path[path.length - 1];
    const cand = [];
    if (cur.c < cols - 1 && !visited[cur.r][cur.c + 1]) cand.push({ r: cur.r, c: cur.c + 1 });
    if (cur.r > 0 && !visited[cur.r - 1][cur.c]) cand.push({ r: cur.r - 1, c: cur.c });
    if (cur.r < rows - 1 && !visited[cur.r + 1][cur.c]) cand.push({ r: cur.r + 1, c: cur.c });
    if (cand.length === 0) {
      if (path.length > 1) { path.pop(); continue; }
      if (cur.c < cols - 1 && !visited[cur.r][cur.c + 1]) { push({ r: cur.r, c: cur.c + 1 }); continue; }
      break;
    }
    const right = cand.find(x => x.c > cur.c);
    let next = right && Math.random() < 0.75 ? right : cand[Math.floor(Math.random() * cand.length)];
    push(next);
  }

  while (path[path.length - 1].c < end.c) {
    const last = path[path.length - 1];
    if (!visited[last.r][last.c + 1]) push({ r: last.r, c: last.c + 1 });
    else break;
  }

  const solvedGrid = Array.from({ length: rows }, () => Array.from({ length: cols }, () => ({ type: "empty", rot: 0 })));
  const set = new Set(path.map(p => `${p.r},${p.c}`));
  for (const p of path) {
    const opens = [];
    for (let d = 0; d < 4; d++) {
      const nr = p.r + DIRS[d].r;
      const nc = p.c + DIRS[d].c;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        if (set.has(`${nr},${nc}`)) opens.push(d);
      }
    }
    let type = "line";
    if (p.r === start.r && p.c === start.c) type = "start";
    else if (p.r === end.r && p.c === end.c) type = "end";
    else {
      if (opens.length === 2) {
        type = ((opens.includes(0) && opens.includes(2)) || (opens.includes(1) && opens.includes(3))) ? "line" : "curve";
      } else if (opens.length === 3) type = "tee";
      else if (opens.length === 4) type = "cross";
      else type = "line";
    }
    const base = TILE_DEFS[type] || [];
    let rot = 0;
    const opensSet = new Set(opens);
    let found = false;
    for (let k = 0; k < 4; k++) {
      const ro = rotateOpenings(base, k);
      if (ro.length === opens.length && ro.every(d => opensSet.has(d))) { rot = k; found = true; break; }
    }
    if (!found && base.length > 0 && opens.length > 0) rot = (opens[0] - base[0] + 4) % 4;
    solvedGrid[p.r][p.c] = { type, rot };
  }

  const filler = ["empty","line","curve","tee"];
  for (let r=0;r<rows;r++){
    for (let c=0;c<cols;c++){
      if (set.has(`${r},${c}`)) continue;
      const t = filler[Math.floor(Math.random()*filler.length)];
      solvedGrid[r][c] = { type: t, rot: Math.floor(Math.random()*4) };
    }
  }

  const initial = solvedGrid.map(row => row.map(cell => ({ type: cell.type, rot: (cell.rot + Math.floor(Math.random()*4))%4 })));
  return { solvedGrid, initialGrid: initial, path };
}

function checkPath(grid) {
  const rows = grid.length, cols = grid[0].length;
  let start=null,end=null;
  for (let r=0;r<rows;r++) for (let c=0;c<cols;c++){
    if (grid[r][c].type==='start') start={r,c};
    if (grid[r][c].type==='end') end={r,c};
  }
  if (!start || !end) return {found:false,path:[]};
  const visited = Array.from({length:rows},()=>Array(cols).fill(false));
  const parent = Array.from({length:rows},()=>Array(cols).fill(null));
  const q=[start]; visited[start.r][start.c]=true;
  const getOpen=(cell)=>rotateOpenings(TILE_DEFS[cell.type]||[], cell.rot);
  let found=false;
  while(q.length){
    const cur=q.shift();
    if (cur.r===end.r && cur.c===end.c){ found=true; break; }
    const opens=getOpen(grid[cur.r][cur.c]);
    for(const d of opens){
      const nr=cur.r+DIRS[d].r, nc=cur.c+DIRS[d].c;
      if (nr<0||nr>=rows||nc<0||nc>=cols) continue;
      const nopens=getOpen(grid[nr][nc]);
      const opp=getOpposite(d);
      if (!nopens.includes(opp)) continue;
      if (!visited[nr][nc]) { visited[nr][nc]=true; parent[nr][nc]=cur; q.push({r:nr,c:nc}); }
    }
  }
  if (!found) return {found:false,path:[]};
  const path=[]; let cur=end;
  while(cur){ path.push(`${cur.r},${cur.c}`); cur=parent[cur.r][cur.c]; }
  return {found:true,path};
}

// Visual tile (SVG)
function TileSVG({cell, highlight, flowIndex}) {
  const size=64, center=size/2, stroke=10;
  const opens=rotateOpenings(TILE_DEFS[cell.type]||[], cell.rot);
  const endPoint=(d)=> d===0?[center,6]:d===1?[size-6,center]:d===2?[center,size-6]:[6,center];
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={64} height={64} className={`${highlight ? "filter drop-shadow-lg" : ""}`}>
      <rect x="0" y="0" width={size} height={size} rx="8" className={`fill-gray-800`} />
      {opens.map((d,i)=>{
        const [x2,y2]=endPoint(d);
        return <line key={i} x1={center} y1={center} x2={x2} y2={y2} strokeWidth={stroke} strokeLinecap="round" className={`stroke-white`} />
      })}
      {cell.type==='start' && <text x={8} y={16} className="fill-emerald-300 font-bold text-[12px]">S</text>}
      {cell.type==='end' && <text x={size-18} y={size-6} className="fill-rose-300 font-bold text-[12px]">E</text>}
      {/* add subtle flow marker if flowIndex true */}
      {typeof flowIndex === "number" && <circle cx={center} cy={center} r={6} className="fill-yellow-300 opacity-90" />}
    </svg>
  );
}

export default function HiddenPathgame() {
  const navigate = useNavigate();
  const LEVEL_COUNT = 10;
  const LEVEL_DURATION = 30;
  const TOTAL_DURATION = 300;

  const levelsRef = useRef([]);
  const intervalRef = useRef(null);

  const [levelIndex, setLevelIndex] = useState(0);
  const [rows, setRows] = useState(getGridSizeForLevel(0));
  const [cols, setCols] = useState(getGridSizeForLevel(0));
  const [grid, setGrid] = useState(() => {
    const { initialGrid } = generateSolvedGrid(getGridSizeForLevel(0), getGridSizeForLevel(0));
    return initialGrid.map((row,r)=>row.map((cell,c)=>({...cell,r,c})));
  });

  const [selected, setSelected] = useState({r:0,c:0});
  const [pathFound, setPathFound] = useState(false);
  const [pathList, setPathList] = useState([]);

  const [levelTime, setLevelTime] = useState(LEVEL_DURATION);
  const [totalTime, setTotalTime] = useState(TOTAL_DURATION);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  // animation states
  const [animatingFlow, setAnimatingFlow] = useState(false);
  const [flowSteps, setFlowSteps] = useState([]); // array of coords currently lit in flow
  const [transitionState, setTransitionState] = useState("idle"); // idle | zoom-out | zoom-in

  const awaitingAdvance = useRef(false);

  function loadLevel(index) {
    const size = getGridSizeForLevel(index);
    const { initialGrid, solvedGrid } = generateSolvedGrid(size, size);
    levelsRef.current[index] = { solvedGrid, initialGrid };
    setRows(size); setCols(size);
    setGrid(initialGrid.map((row,r)=>row.map((cell,c)=>({...cell,r,c}))));
    setLevelTime(LEVEL_DURATION);
    setSelected({r:0,c:0});
    setPathFound(false); setPathList([]);
  }

  useEffect(()=> {
    loadLevel(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(()=> {
      setLevelTime(t => Math.max(0,t-1));
      setTotalTime(t => Math.max(0,t-1));
    }, 1000);
    return ()=> clearInterval(intervalRef.current);
    // eslint-disable-next-line
  }, []);

  useEffect(()=> {
    if (totalTime===0 && !gameOver) {
      clearInterval(intervalRef.current);
      setGameOver(true);
    }
  }, [totalTime, gameOver]);

  useEffect(()=> {
    if (levelTime===0 && !gameOver && !awaitingAdvance.current && !animatingFlow) {
      awaitingAdvance.current = true;
      setTimeout(()=> {
        nextLevel(false);
        awaitingAdvance.current = false;
      }, 250);
    }
  }, [levelTime, gameOver, animatingFlow]);

  // check connectivity and trigger flow animation when found
  useEffect(()=> {
    const simple = grid.map(r => r.map(c => ({ type: c.type, rot: c.rot })));
    const res = checkPath(simple);
    setPathFound(res.found);
    setPathList(res.path || []);
    if (res.found && !awaitingAdvance.current && !animatingFlow && !gameOver) {
      // start flow animation sequence
      startFlowAnimation(res.path);
    }
    // eslint-disable-next-line
  }, [grid]);

  function rotateCell(r,c, dir=1) {
    setSelected({r,c});
    setGrid(prev => {
      const copy = prev.map(row => row.map(cell => ({...cell})));
      copy[r][c].rot = (copy[r][c].rot + dir + 4) % 4;
      return copy;
    });
  }

  function swapRotateSelected() {
    const {r,c} = selected;
    if (r == null || c == null) return;
    setGrid(prev => {
      const copy = prev.map(row=>row.map(cell=>({...cell})));
      if (c < cols - 1) {
        copy[r][c].rot = (copy[r][c].rot + 1) %4;
        copy[r][c+1].rot = (copy[r][c+1].rot + 1) %4;
      } else if (c > 0) {
        copy[r][c].rot = (copy[r][c].rot + 1) %4;
        copy[r][c-1].rot = (copy[r][c-1].rot + 1) %4;
      }
      return copy;
    });
  }

  function nextLevel(solved) {
    if (gameOver) return;
    if (solved) setScore(s => s+1);
    if (levelIndex >= LEVEL_COUNT - 1) {
      // finish
      clearInterval(intervalRef.current);
      setGameOver(true);
      setLevelIndex(i => i + 1);
      return;
    }
    const nextIdx = levelIndex + 1;
    setLevelIndex(nextIdx);
    loadLevel(nextIdx);
  }

  function manualCheck() {
    if (pathFound) {
      if (!awaitingAdvance.current && !animatingFlow) {
        awaitingAdvance.current = true;
        startFlowAnimation(pathList); // ensure animation runs even if pathFound true but effect not fired
      }
    } else {
      alert("No complete path yet.");
    }
  }

  // Flow animation: animate tiles along path (start -> end)
  async function startFlowAnimation(pathArr) {
    if (!Array.isArray(pathArr) || pathArr.length === 0) return;
    // BFS produced path as end->...->start, so reverse to start->end
    const path = [...pathArr].reverse(); // each entry "r,c"
    // pause timers
    if (intervalRef.current) clearInterval(intervalRef.current);
    setAnimatingFlow(true);
    setFlowSteps([]);

    // small initial glow
    await new Promise(res => setTimeout(res, 100));

    for (let i=0;i<path.length;i++){
      const coords = path.slice(0, i+1);
      setFlowSteps(coords);
      // optionally add per-tile small pop => 110ms per tile
      await new Promise(res => setTimeout(res, 120));
    }

    // final burst: keep lit for a short time
    await new Promise(res => setTimeout(res, 250));

    // zoom out -> next level -> zoom in sequence
    setTransitionState("zoom-out");
    await new Promise(res => setTimeout(res, 420)); // match CSS timing

    // call next level (mark as solved)
    awaitingAdvance.current = true;
    nextLevel(true);
    awaitingAdvance.current = false;

    // perform zoom-in entrance
    setTransitionState("zoom-in");
    // allow new grid to settle (loadLevel already set grid & reset timers below)
    await new Promise(res => setTimeout(res, 420));

    // restart timers
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(()=> {
      setLevelTime(t => Math.max(0,t-1));
      setTotalTime(t => Math.max(0,t-1));
    }, 1000);

    // clear flow & transition
    setFlowSteps([]);
    setAnimatingFlow(false);
    setTransitionState("idle");
  }

  // When loadLevel is called by nextLevel, we need to ensure timers and selected states are reset.
  // We already used loadLevel inside nextLevel; for restart after transition the effect above restarts timers.

  // UI helpers
  const formatTime = s => {
    const m = Math.floor(s/60).toString();
    const sec = (s%60).toString().padStart(2,"0");
    return `${m}:${sec}`;
  };

  if (gameOver) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-xl text-center">
          <h2 className="text-2xl font-semibold mb-4">Game Complete</h2>
          <p className="text-lg mb-4">Final Score: <span className="font-mono">{score}</span> / {LEVEL_COUNT}</p>
          <div className="flex justify-center gap-3">
            <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={()=>{
              // restart
              setScore(0);
              setLevelIndex(0);
              setTotalTime(TOTAL_DURATION);
              setGameOver(false);
              levelsRef.current = [];
              loadLevel(0);
              if (intervalRef.current) clearInterval(intervalRef.current);
              intervalRef.current = setInterval(()=> {
                setLevelTime(t => Math.max(0,t-1));
                setTotalTime(t => Math.max(0,t-1));
              }, 1000);
            }}>Play Again</button>
            <button className="px-4 py-2 mx-2 bg-gray-600 text-white rounded" onClick={()=>{
              // exit to home - for demo just reload page
                navigate("/");
            }}>Exit</button>
          </div>
        </div>
      </div>
    );
  }

  // CSS classes for transition states
  const boardTransitionClass = transitionState==="zoom-out" ? "transform transition-all duration-400 scale-75 opacity-0" :
                               transitionState==="zoom-in" ? "transform transition-all duration-400 scale-95 opacity-100" :
                               "transform transition-all duration-200 scale-100";

  // helper to see if given cell is lit in the flow (flowSteps contains "r,c")
  const isLit = (r,c) => flowSteps.includes(`${r},${c}`);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-5xl w-full">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-3xl">directions_boat</span>
            <h1 className="text-xl font-semibold">Grid Path Puzzle</h1>
          </div>
          <div className="text-sm text-gray-500">Section {Math.min(2, Math.ceil((levelIndex+1)/5))} of 2</div>
        </div>

        <div className={`relative border border-gray-200 rounded-md p-4 mb-4 bg-white ${boardTransitionClass}`} style={{transitionTimingFunction: 'ease-in-out'}}>
          <img
            src={"/mnt/data/Screenshot 2025-11-21 025101.png"}
            alt="reference"
            className="absolute inset-4 w-[calc(100%-2rem)] h-[calc(100%-2rem)] object-cover pointer-events-none select-none rounded-md"
            style={{ opacity: 0.06 }}
          />

          <div
            className="grid gap-px bg-gray-200 rounded mx-auto"
            style={{
              gridTemplateColumns: `repeat(${cols}, 72px)`,
              width: Math.min(72*cols, 72*8),
            }}
          >
            {grid.map((row,r)=>row.map((cell,c)=>{
              const key = `${r}-${c}`;
              const isSelected = selected.r===r && selected.c===c;
              const onPath = pathList.includes(`${r},${c}`);
              const lit = isLit(r,c);
              return (
                <button
                  key={key}
                  onClick={(e)=>{ e.preventDefault(); setSelected({r,c}); rotateCell(r,c,1); }}
                  onContextMenu={(e)=>{ e.preventDefault(); setSelected({r,c}); rotateCell(r,c,-1); }}
                  className={`w-18 h-18 flex items-center justify-center bg-gray-50 border ${isSelected ? "border-yellow-400" : onPath ? "border-emerald-400" : "border-transparent"}`}
                  style={{ width:72, height:72, padding:0 }}
                >
                  <div className="relative">
                    <div className={`absolute inset-0 rounded-md ${lit ? "bg-yellow-400/30 animate-flow-glow" : ""}`} />
                    <div className={`relative z-10`}>
                      <TileSVG cell={cell} highlight={isSelected || onPath} flowIndex={lit ? 1 : undefined}/>
                    </div>
                  </div>
                </button>
              );
            }))}
          </div>
        </div>

        {/* controls */}
        <div className="flex items-center justify-center gap-4 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <div className="text-sm font-mono">{formatTime(levelTime)}</div>
            </div>
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <div className="text-sm font-mono">{formatTime(totalTime)}</div>
            </div>
          </div>

          <button className="w-12 h-12 bg-gray-700 text-white rounded-md flex items-center justify-center" onClick={()=>{
            // reshuffle current level keeping solved layout (if exist)
            const lvl = levelsRef.current[levelIndex];
            if (lvl && lvl.solvedGrid) {
              const newInit = lvl.solvedGrid.map(row => row.map(cell => ({ type: cell.type, rot: (cell.rot + Math.floor(Math.random()*4))%4 })));
              setGrid(newInit.map((row,r)=>row.map((cell,c)=>({...cell,r,c}))));
            } else loadLevel(levelIndex);
          }}><span className="material-symbols-outlined">refresh</span></button>

          <button className="w-12 h-12 bg-gray-700 text-white rounded-md flex items-center justify-center" onClick={swapRotateSelected}><span className="material-symbols-outlined">swap_horiz</span></button>

          <button className="w-12 h-12 bg-green-600 text-white rounded-md flex items-center justify-center" onClick={manualCheck}><span className="material-symbols-outlined">check</span></button>
        </div>

        <div className="text-center text-sm text-gray-600">
          <div className="mb-2">{pathFound ? <span className="text-emerald-600 font-semibold">Connected</span> : <span className="text-amber-500">Not connected</span>}</div>
          <div>Level {levelIndex+1} / {LEVEL_COUNT} • Grid {rows}×{cols} • Score: <span className="font-mono">{score}</span></div>
        </div>

        {/* small CSS in-js for flow glow keyframes */}
        <style>{`
          @keyframes flowGlow {
            0% { box-shadow: 0 0 0px rgba(250, 204, 21, 0.0); }
            50% { box-shadow: 0 0 16px rgba(250, 204, 21, 0.9); }
            100% { box-shadow: 0 0 0px rgba(250, 204, 21, 0.0); }
          }
          .animate-flow-glow {
            animation: flowGlow 0.9s ease-in-out infinite;
          }
        `}</style>
      </div>
    </div>
  );
}
