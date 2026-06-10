import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import ChatPage from './pages/ChatPage'
import LobbyPage from './pages/LobbyPage'
import RoomPage from './pages/RoomPage'
import RoleAssignmentPage from './pages/RoleAssignmentPage'

function App() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/lobby" element={<LobbyPage />} />
        <Route path="/room/:roomId" element={<RoomPage />} />
        <Route path="/room/:roomId/assign" element={<RoleAssignmentPage />} />
        <Route path="/chat/:characterId" element={<ChatPage />} />
      </Routes>
    </div>
  )
}

export default App
