import { useGameStore } from './store/gameStore';
import HomeScreen from './screens/HomeScreen';
import SetupScreen from './screens/SetupScreen';
import GameScreen from './screens/GameScreen';
import VictoryScreen from './screens/VictoryScreen';
import Board3DScreen from './screens/Board3DScreen';
import OnlineScreen from './screens/OnlineScreen';

export default function App() {
  const screen = useGameStore((s) => s.screen);
  const toast = useGameStore((s) => s.toast);

  return (
    <>
      {screen === 'home' && <HomeScreen />}
      {screen === 'setup' && <SetupScreen />}
      {screen === 'game' && <GameScreen />}
      {screen === 'victory' && <VictoryScreen />}
      {screen === 'board3d' && <Board3DScreen />}
      {screen === 'online' && <OnlineScreen />}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl bg-slate-800 border border-slate-600 text-sm text-slate-100 shadow-2xl max-w-xs text-center">
          {toast}
        </div>
      )}
    </>
  );
}
