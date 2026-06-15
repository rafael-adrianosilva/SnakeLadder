import { ArrowLeft } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import Board from '../components/Board';
import Dice from '../components/Dice';
import PlayerHUD from '../components/PlayerHUD';

export default function GameScreen() {
  const players = useGameStore((s) => s.players);
  const board = useGameStore((s) => s.board);
  const currentIndex = useGameStore((s) => s.currentIndex);
  const phase = useGameStore((s) => s.phase);
  const diceFace = useGameStore((s) => s.diceFace);
  const requestRoll = useGameStore((s) => s.requestRoll);
  const goHome = useGameStore((s) => s.goHome);
  const log = useGameStore((s) => s.log);

  const current = players[currentIndex];
  const isBotTurn = current?.isBot ?? false;
  const rolling = phase === 'rolling';
  const busy = phase !== 'idle';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center p-4 font-sans">
      <header className="w-full max-w-md flex items-center justify-between mb-3">
        <button
          onClick={goHome}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
          aria-label="Sair da partida"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div
          className="px-4 py-1.5 rounded-full text-sm font-bold border"
          style={{ borderColor: current?.color, color: current?.color }}
        >
          Vez de {current?.name}
          {isBotTurn ? ' (pensando…)' : ''}
        </div>
        <div className="w-9" />
      </header>

      <div className="w-full max-w-md space-y-4">
        <PlayerHUD players={players} currentIndex={currentIndex} />
        <Board players={players} board={board} />

        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 h-24 overflow-y-auto rounded-xl bg-slate-900/50 border border-slate-800 p-2 text-[11px] text-slate-400 space-y-1">
            {log.map((entry, i) => (
              <div key={i} className={i === 0 ? 'text-slate-200' : ''}>
                {entry}
              </div>
            ))}
          </div>
          <Dice
            face={diceFace}
            rolling={rolling}
            disabled={busy || isBotTurn}
            onRoll={requestRoll}
            label={isBotTurn ? 'Aguarde…' : busy ? '…' : 'Lançar Dado'}
          />
        </div>
      </div>
    </div>
  );
}
