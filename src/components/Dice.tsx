const FACES = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

interface DiceProps {
  face: number;
  rolling: boolean;
  disabled: boolean;
  onRoll: () => void;
  label: string;
}

export default function Dice({ face, rolling, disabled, onRoll, label }: DiceProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`w-20 h-20 rounded-2xl bg-white text-slate-900 flex items-center justify-center text-6xl leading-none shadow-xl ${
          rolling ? 'animate-pulse' : ''
        }`}
        aria-live="polite"
        aria-label={`Dado: ${face}`}
      >
        {FACES[face] ?? '⚀'}
      </div>
      <button
        onClick={onRoll}
        disabled={disabled}
        className="px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30 disabled:opacity-40 disabled:cursor-not-allowed enabled:hover:scale-105 transition-transform"
      >
        {label}
      </button>
    </div>
  );
}
