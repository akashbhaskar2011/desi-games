import { Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { Home } from "./pages/Home";
import { Games } from "./pages/Games";
import { GameDetails } from "./pages/GameDetails";
import { HowToPlay } from "./pages/HowToPlay";
import { NotFound } from "./pages/NotFound";
import { CreateRoom } from "./pages/CreateRoom";
import { JoinRoom } from "./pages/JoinRoom";
import { Room } from "./pages/Room";
import { Play } from "./pages/Play";
import { GameRulesPage } from "./pages/GameRulesPage";
import { ActiveMatchProvider } from "./hooks/useActiveMatch";
import { ActiveMatchBanner } from "./components/ActiveMatchBanner";

export default function App() {
  return (
    <ActiveMatchProvider>
      <div className="app-shell">
        <Navbar />
        <ActiveMatchBanner />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/games" element={<Games />} />
            <Route path="/games/:slug" element={<GameDetails />} />
            <Route path="/games/:gameId/rules" element={<GameRulesPage />} />
            <Route path="/create/:gameId" element={<CreateRoom />} />
            <Route path="/join/:roomCode" element={<JoinRoom />} />
            <Route path="/room/:roomCode" element={<Room />} />
            <Route path="/play/:roomCode" element={<Play />} />
            <Route path="/how-to-play" element={<HowToPlay />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </ActiveMatchProvider>
  );
}
