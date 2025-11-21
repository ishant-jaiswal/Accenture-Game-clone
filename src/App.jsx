import { Routes, Route } from "react-router-dom"

import BalloonHome from "./components/balloonHome/BalloonHome"
import BalloonGame from "./components/balloonHome/BalloonGame"
import HiddenPathHome from "./components/hiddenPath/HiddenPathHome"
import HiddenPathGame from "./components/hiddenPath/HiddenPathGame"
import MemoryMatrixHome from "./components/MemoryMatrix/MemoryMatrixHome"
import  MemoryMatrixGame  from "./components/MemoryMatrix/MemoryMatrixGame"
import HomeScreen  from "./main/HomeScreen"

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeScreen />} />

      <Route path="/balloon" element={<BalloonHome />} />
      <Route path="/balloon/game" element={<BalloonGame />} />

      <Route path="/memory" element={<MemoryMatrixHome />} />
      <Route path="/memory/game" element={<MemoryMatrixGame />} />

      <Route path="/hidden" element={<HiddenPathHome />} />
      <Route path="/hidden/game" element={<HiddenPathGame />} />
    </Routes>
  )
}
