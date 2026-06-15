import { useState, type ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useGameStore, type SetupConfig } from '../store/gameStore';

export default function SetupScreen() {
  const mode = useGameStore((s) => s.mode);
  const goHome = useGameStore((s) => s.goHome);
  const startGame = useGameStore((s) => s.startGame);

  const [playerCount, setPlayerCount] = useState(2);
  const [botCount, setBotCount] = useState(1);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [names, setNames] = useState<string[]>(['Jogador 1', 'Jogador 2', 'Jogador 3', 'Jogador 4']);

  const isLocal = mode === 'local';

  function handleStart() {
    const config: SetupConfig = {
      mode: isLocal ? 'local' : 'bot',
      humanNames: names.slice(0, playerCount),
      botCount,
      difficulty,
    };
    startGame(config);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center p-6 font-sans">
      <header className="w-full max-w-md flex items-center gap-3 mb-8">
        <button
          onClick={goHome}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
          aria-label="Voltar"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-black">
          {isLocal ? 'Multiplayer Local' : 'Contra Bots'}
        </h1>
      </header>

      <main className="w-full max-w-md space-y-6">
        {isLocal ? (
          <>
            <Section title="Número de jogadores">
              <Segmented
                options={[2, 3, 4]}
                value={playerCount}
                onChange={setPlayerCount}
                render={(v) => `${v}`}
              />
            </Section>
            <Section title="Nomes">
              <div className="space-y-2">
                {Array.from({ length: playerCount }).map((_, i) => (
                  <input
                    key={i}
                    value={names[i]}
                    onChange={(e) => {
                      const next = [...names];
                      next[i] = e.target.value;
                      setNames(next);
                    }}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 focus:border-indigo-500 outline-none text-sm"
                    placeholder={`Jogador ${i + 1}`}
                  />
                ))}
              </div>
            </Section>
          </>
        ) : (
          <>
            <Section title="Número de bots">
              <Segmented
                options={[1, 2, 3]}
                value={botCount}
                onChange={setBotCount}
                render={(v) => `${v}`}
              />
            </Section>
            <Section title="Dificuldade">
              <Segmented
                options={['easy', 'medium', 'hard'] as const}
                value={difficulty}
                onChange={setDifficulty}
                render={(v) => ({ easy: 'Fácil', medium: 'Médio', hard: 'Difícil' }[v])}
              />
            </Section>
          </>
        )}

        <button
          onClick={handleStart}
          className="w-full py-4 rounded-2xl font-black text-lg text-white bg-gradient-to-r from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30 hover:scale-[1.02] transition-transform"
        >
          Começar Partida
        </button>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-3">
      <h2 className="text-xs uppercase tracking-widest text-slate-400 font-bold">{title}</h2>
      {children}
    </div>
  );
}

function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  render,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  render: (v: T) => string;
}) {
  return (
    <div className="flex gap-2">
      {options.map((opt) => (
        <button
          key={String(opt)}
          onClick={() => onChange(opt)}
          className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all ${
            value === opt
              ? 'bg-indigo-500 border-indigo-400 text-white'
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
          }`}
        >
          {render(opt)}
        </button>
      ))}
    </div>
  );
}
