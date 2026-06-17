import type { Player } from '../engine/gameEngine';

interface PlayerHUDProps {
  players: Player[];
  currentIndex: number;
}

export default function PlayerHUD({ players, currentIndex }: PlayerHUDProps) {
  return (
    <div className="grid grid-cols-2 gap-2.5 w-full">
      {players.map((p, idx) => {
        const active = idx === currentIndex;
        return (
          <div
            key={p.id}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
              active
                ? 'border-indigo-400/80 bg-indigo-500/10 shadow-lg shadow-indigo-500/5 ring-1 ring-indigo-400/40'
                : 'border-slate-800 bg-slate-900/30 opacity-70'
            }`}
          >
            {/* Brilho neon dinâmico no topo do ativo */}
            {active && (
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-pulse" />
            )}

            <div className="relative flex items-center justify-center">
              <div
                className={`w-4 h-4 rounded-full border border-white/80 shrink-0 shadow-md ${
                  active ? 'scale-110' : ''
                }`}
                style={{ backgroundColor: p.color }}
              />
              {active && (
                <div
                  className="absolute w-4 h-4 rounded-full border opacity-70 animate-ping"
                  style={{ borderColor: p.color }}
                />
              )}
            </div>

            <div className="min-w-0">
              <div className="text-sm font-bold text-slate-200 truncate flex items-center gap-1">
                {p.name} {p.isBot ? '🤖' : ''}
              </div>
              <div className="text-[11px] font-semibold text-slate-400">
                Casa <span className={active ? 'text-indigo-300 font-bold' : ''}>{p.position}</span>
              </div>
            </div>

            {active && (
              <span className="ml-auto text-[9px] bg-indigo-500/30 border border-indigo-400/40 text-indigo-300 font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider animate-pulse">
                Sua Vez
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
