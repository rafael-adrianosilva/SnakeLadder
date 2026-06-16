import type { Player } from '../engine/gameEngine';

interface PlayerHUDProps {
  players: Player[];
  currentIndex: number;
}

export default function PlayerHUD({ players, currentIndex }: PlayerHUDProps) {
  return (
    <div className="grid grid-cols-2 gap-2 w-full">
      {players.map((p, idx) => {
        const active = idx === currentIndex;
        return (
          <div
            key={p.id}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${
              active
                ? 'border-indigo-400 bg-indigo-500/10 ring-1 ring-indigo-400/50'
                : 'border-slate-700 bg-slate-800/40'
            }`}
          >
            <div
              className="w-4 h-4 rounded-full border border-white/70 shrink-0"
              style={{ backgroundColor: p.color }}
            />
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-200 truncate">
                {p.name} {p.isBot ? '🤖' : ''}
              </div>
              <div className="text-[11px] text-slate-400">Casa {p.position}</div>
            </div>
            {active && <span className="ml-auto text-[10px] text-indigo-300 font-bold">VEZ</span>}
          </div>
        );
      })}
    </div>
  );
}
