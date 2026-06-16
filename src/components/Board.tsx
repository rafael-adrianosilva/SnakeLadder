import { getCellCoordinates, type Player, type BoardConfig } from '../engine/gameEngine';

interface BoardProps {
  players: Player[];
  board: BoardConfig;
}

/** Centro de uma casa em % (0..100) — usado para desenhar os conectores. */
function cellCenter(n: number): { x: number; y: number } {
  const { col, row } = getCellCoordinates(n);
  return { x: col * 10 + 5, y: (9 - row) * 10 + 5 };
}

/** Tabuleiro 10×10 em serpentina (seção 5). Casa 100 no topo. */
export default function Board({ players, board }: BoardProps) {
  const cells: number[] = [];
  // De cima (linha visual 0 = casas 100..91) para baixo.
  for (let visualRow = 0; visualRow < 10; visualRow++) {
    const boardRow = 9 - visualRow;
    for (let col = 0; col < 10; col++) {
      const n = boardRow % 2 === 0 ? boardRow * 10 + col + 1 : boardRow * 10 + (9 - col) + 1;
      cells.push(n);
    }
  }

  return (
    <div className="relative w-full aspect-square rounded-2xl overflow-hidden border border-slate-700 shadow-2xl">
      <div className="grid grid-cols-10 grid-rows-10 w-full h-full">
        {cells.map((n) => {
          const isLadderBase = board.ladders[n] !== undefined;
          const isSnakeHead = board.snakes[n] !== undefined;
          const ladderTop = Object.values(board.ladders).includes(n);
          const snakeTail = Object.values(board.snakes).includes(n);

          let bg = (n % 2 === 0) ? 'bg-slate-800/70' : 'bg-slate-800/40';
          if (isLadderBase) bg = 'bg-emerald-600/30';
          if (isSnakeHead) bg = 'bg-rose-600/30';

          return (
            <div
              key={n}
              data-cell={n}
              className={`relative flex items-start justify-start ${bg} border border-slate-700/40 text-[9px] sm:text-[11px] text-slate-400 p-0.5`}
            >
              <span className="font-mono leading-none">{n}</span>
              {isLadderBase ? (
                <span className="absolute bottom-0.5 right-0.5 text-[8px] sm:text-[11px] font-bold leading-none text-emerald-300">
                  🪜→{board.ladders[n]}
                </span>
              ) : isSnakeHead ? (
                <span className="absolute bottom-0.5 right-0.5 text-[8px] sm:text-[11px] font-bold leading-none text-rose-300">
                  🐍→{board.snakes[n]}
                </span>
              ) : ladderTop ? (
                <span className="absolute bottom-0.5 right-0.5 text-[10px] sm:text-sm leading-none">✨</span>
              ) : snakeTail ? (
                <span className="absolute bottom-0.5 right-0.5 text-[10px] sm:text-sm leading-none text-rose-400/50">
                  ·
                </span>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* Conectores: linhas verdes (escadas) e vermelhas (cobras) origem→destino */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
        <defs>
          <marker id="head-ladder" markerWidth="4" markerHeight="4" refX="2" refY="2" orient="auto">
            <path d="M0,0 L4,2 L0,4 Z" fill="#34d399" />
          </marker>
          <marker id="head-snake" markerWidth="4" markerHeight="4" refX="2" refY="2" orient="auto">
            <path d="M0,0 L4,2 L0,4 Z" fill="#fb7185" />
          </marker>
        </defs>
        {Object.entries(board.ladders).map(([from, to]) => {
          const a = cellCenter(Number(from));
          const b = cellCenter(to);
          return (
            <line
              key={`ladder-${from}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="#34d399"
              strokeWidth={1}
              strokeLinecap="round"
              opacity={0.5}
              markerEnd="url(#head-ladder)"
            />
          );
        })}
        {Object.entries(board.snakes).map(([from, to]) => {
          const a = cellCenter(Number(from));
          const b = cellCenter(to);
          return (
            <line
              key={`snake-${from}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="#fb7185"
              strokeWidth={1}
              strokeLinecap="round"
              opacity={0.5}
              markerEnd="url(#head-snake)"
            />
          );
        })}
      </svg>

      {/* Camada de peças */}
      <div className="absolute inset-0 pointer-events-none">
        {players.map((p, idx) => {
          if (p.position < 1) return null;
          const { col, row } = getCellCoordinates(p.position);
          const topRow = 9 - row;
          const groupOffset = (idx % 2) * 14 + 4; // espalha quando há vários na casa
          const groupOffsetY = Math.floor(idx / 2) * 14 + 4;
          return (
            <div
              key={p.id}
              className="absolute transition-all duration-200 ease-out"
              style={{
                left: `calc(${col * 10}% + ${groupOffset}px)`,
                top: `calc(${topRow * 10}% + ${groupOffsetY}px)`,
                width: '10%',
              }}
            >
              <div
                className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-white/80 shadow-lg"
                style={{ backgroundColor: p.color }}
                title={`${p.name} — casa ${p.position}`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
