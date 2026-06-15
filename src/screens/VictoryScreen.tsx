import { Trophy, Home, RotateCcw } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

export default function VictoryScreen() {
  const winner = useGameStore((s) => s.winner);
  const players = useGameStore((s) => s.players);
  const mode = useGameStore((s) => s.mode);
  const goHome = useGameStore((s) => s.goHome);
  const openSetup = useGameStore((s) => s.openSetup);

  const ranking = [...players].sort((a, b) => b.position - a.position);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/20 to-transparent pointer-events-none" />

      <div className="z-10 flex flex-col items-center gap-6 w-full max-w-sm">
        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-yellow-400 to-amber-600 flex items-center justify-center shadow-2xl shadow-amber-500/40 animate-bounce">
          <Trophy className="w-12 h-12 text-white" />
        </div>

        <div className="text-center">
          <p className="text-sm uppercase tracking-widest text-amber-400 font-bold">Vitória!</p>
          <h1 className="text-4xl font-black mt-1" style={{ color: winner?.color }}>
            {winner?.name}
          </h1>
          <p className="text-slate-400 text-sm mt-1">chegou à casa 100 primeiro 🎉</p>
        </div>

        <div className="w-full space-y-2">
          {ranking.map((p, i) => (
            <div
              key={p.id}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700"
            >
              <span className="font-black text-slate-500 w-5">{i + 1}º</span>
              <div className="w-4 h-4 rounded-full border border-white/60" style={{ backgroundColor: p.color }} />
              <span className="font-semibold text-slate-200 flex-1">{p.name}</span>
              <span className="text-xs text-slate-400">Casa {p.position}</span>
            </div>
          ))}
        </div>

        <div className="w-full flex gap-3">
          <button
            onClick={goHome}
            className="flex-1 py-3 rounded-xl font-bold bg-slate-800 hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" /> Menu
          </button>
          <button
            onClick={() => openSetup(mode ?? 'bot')}
            className="flex-1 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" /> Jogar de novo
          </button>
        </div>
      </div>
    </div>
  );
}
