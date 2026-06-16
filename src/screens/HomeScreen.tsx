import type { ReactNode } from 'react';
import { Dices, Users, Bot, Globe, Coins, ShieldAlert, CheckCircle2, Box } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

export default function HomeScreen() {
  const openSetup = useGameStore((s) => s.openSetup);
  const viewBoard3D = useGameStore((s) => s.viewBoard3D);
  const openOnline = useGameStore((s) => s.openOnline);
  const isFirebaseConfigured = !!import.meta.env.VITE_FIREBASE_API_KEY;
  const coins = 150;
  const userName = 'General';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-between p-6 relative overflow-hidden font-sans select-none">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-900/10 rounded-full blur-[120px] pointer-events-none" />

      <header className="w-full max-w-5xl flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-indigo-500 to-violet-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-500/20">
            <Dices className="w-6 h-6 text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 to-slate-200">
            SNAKE & LADDERS
          </span>
        </div>

        <div className="flex items-center gap-4 bg-slate-900/60 backdrop-blur-md border border-slate-800/80 px-4 py-2 rounded-2xl">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-500/20 rounded-full flex items-center justify-center border border-indigo-500/40">
              <span className="text-xs font-bold text-indigo-400">G</span>
            </div>
            <span className="text-sm font-semibold text-slate-300">{userName}</span>
          </div>
          <div className="h-4 w-[1px] bg-slate-800" />
          <div className="flex items-center gap-1.5 text-yellow-500">
            <Coins className="w-4 h-4" />
            <span className="text-sm font-bold">{coins}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-md flex flex-col justify-center items-center gap-8 z-10 py-12">
        <div className="text-center space-y-3">
          <div className="inline-block px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold rounded-full uppercase tracking-widest mb-2">
            Edição Premium
          </div>
          <h1 className="text-5xl font-black tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-violet-400">
            Cobrinhas <br />& Escadas
          </h1>
          <p className="text-sm text-slate-400 max-w-xs mx-auto">
            Suba as escadas, evite as cobras e desafie seus oponentes no clássico jogo de tabuleiro.
          </p>
        </div>

        <div className="w-full space-y-4">
          <ModeButton
            onClick={() => openSetup('bot')}
            icon={<Bot className="w-6 h-6" />}
            accent="indigo"
            title="Contra Inteligência Artificial"
            subtitle="Jogue solo contra Zilda, Rex ou Cyber-7."
          />
          <ModeButton
            onClick={() => openSetup('local')}
            icon={<Users className="w-6 h-6" />}
            accent="violet"
            title="Multiplayer Local"
            subtitle="Jogue com amigos passando o mesmo dispositivo."
          />
          <ModeButton
            onClick={openOnline}
            icon={<Globe className="w-6 h-6" />}
            accent="emerald"
            title="Partida Online"
            subtitle="Crie uma sala e jogue com amigos em tempo real."
          />
          <ModeButton
            onClick={viewBoard3D}
            icon={<Box className="w-6 h-6" />}
            accent="violet"
            title="Ver Tabuleiro 3D"
            subtitle="Mockup 3D do tabuleiro (Three.js / R3F)."
          />
        </div>

        <div className="w-full bg-slate-900/30 border border-slate-800 px-4 py-3 rounded-xl flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium">Status do Banco de Dados:</span>
          {isFirebaseConfigured ? (
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Firebase Conectado
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-yellow-500 font-bold">
              <ShieldAlert className="w-3.5 h-3.5" />
              Modo Offline / Emulador
            </div>
          )}
        </div>
      </main>

      <footer className="w-full max-w-5xl flex justify-between items-center text-[10px] text-slate-500 border-t border-slate-900 pt-4 z-10">
        <span>Desenvolvido com React + TS + Tailwind CSS</span>
        <span>General Edition © 2026</span>
      </footer>
    </div>
  );
}

const ACCENTS: Record<string, string> = {
  indigo: 'hover:border-indigo-500/40 group-hover:bg-indigo-500 text-indigo-400 bg-indigo-500/10',
  violet: 'hover:border-violet-500/40 group-hover:bg-violet-500 text-violet-400 bg-violet-500/10',
  emerald: 'hover:border-emerald-500/40 group-hover:bg-emerald-500 text-emerald-400 bg-emerald-500/10',
};

function ModeButton({
  onClick,
  icon,
  title,
  subtitle,
  accent,
}: {
  onClick: () => void;
  icon: ReactNode;
  title: string;
  subtitle: string;
  accent: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full group relative flex items-center justify-between p-5 bg-gradient-to-r from-slate-900 to-slate-800 hover:to-slate-900 border border-slate-800 rounded-2xl transition-all duration-300 shadow-md ${ACCENTS[accent]}`}
    >
      <div className="flex items-center gap-4 text-left">
        <div
          className={`p-3 rounded-xl transition-all duration-300 group-hover:text-white ${ACCENTS[accent]}`}
        >
          {icon}
        </div>
        <div>
          <h3 className="font-bold text-slate-200 group-hover:text-white transition-colors">
            {title}
          </h3>
          <p className="text-xs text-slate-400">{subtitle}</p>
        </div>
      </div>
      <div className="w-8 h-8 rounded-full border border-slate-800 flex items-center justify-center text-slate-500 transition-all">
        →
      </div>
    </button>
  );
}
