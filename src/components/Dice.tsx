import { useState, useEffect } from 'react';

interface DiceProps {
  face: number;
  rolling: boolean;
  disabled: boolean;
  onRoll: () => void;
  label: string;
}

// Mapeamento de ângulos 3D em graus para exibir a respectiva face da frente
const ROTATIONS: Record<number, string> = {
  1: 'rotateX(0deg) rotateY(0deg)',
  2: 'rotateX(-90deg) rotateY(0deg)',
  3: 'rotateX(0deg) rotateY(90deg)',
  4: 'rotateX(0deg) rotateY(-90deg)',
  5: 'rotateX(90deg) rotateY(0deg)',
  6: 'rotateX(180deg) rotateY(0deg)',
};

export default function Dice({ face, rolling, disabled, onRoll, label }: DiceProps) {
  const [style3D, setStyle3D] = useState(ROTATIONS[1]);

  useEffect(() => {
    if (rolling) {
      // Giro aleatório frenético simulando a rolagem física
      const rx = Math.floor(Math.random() * 360) + 720;
      const ry = Math.floor(Math.random() * 360) + 720;
      setStyle3D(`rotateX(${rx}deg) rotateY(${ry}deg)`);
    } else {
      // Fixa na rotação da face final obtida
      setStyle3D(ROTATIONS[face] ?? ROTATIONS[1]);
    }
  }, [face, rolling]);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Container 3D com perspectiva */}
      <div className="w-24 h-24 flex items-center justify-center [perspective:1000px]">
        <div
          className="w-16 h-16 relative [transform-style:preserve-3d] transition-transform duration-500 ease-out"
          style={{ transform: style3D }}
        >
          {/* FACE 1 */}
          <div className="absolute inset-0 bg-white border border-slate-300 rounded-xl flex items-center justify-center shadow-md [backface-visibility:hidden] [transform:translateZ(32px)]">
            <div className="w-3.5 h-3.5 bg-red-600 rounded-full" />
          </div>
          {/* FACE 6 */}
          <div className="absolute inset-0 bg-white border border-slate-300 rounded-xl p-3 grid grid-cols-3 gap-1 shadow-md [backface-visibility:hidden] [transform:rotateX(180deg)_translateZ(32px)]">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="w-2.5 h-2.5 bg-slate-900 rounded-full mx-auto" />
            ))}
          </div>
          {/* FACE 2 */}
          <div className="absolute inset-0 bg-white border border-slate-300 rounded-xl p-3 flex justify-between items-center shadow-md [backface-visibility:hidden] [transform:rotateX(90deg)_translateZ(32px)]">
            <div className="w-2.5 h-2.5 bg-slate-900 rounded-full self-start" />
            <div className="w-2.5 h-2.5 bg-slate-900 rounded-full self-end" />
          </div>
          {/* FACE 5 */}
          <div className="absolute inset-0 bg-white border border-slate-300 rounded-xl p-2.5 grid grid-cols-3 gap-1 shadow-md [backface-visibility:hidden] [transform:rotateX(-90deg)_translateZ(32px)]">
            <div className="w-2.5 h-2.5 bg-slate-900 rounded-full self-start" />
            <div className="w-2.5 h-2.5 bg-slate-900 rounded-full self-end" />
            <div className="w-2.5 h-2.5 bg-slate-900 rounded-full place-self-center col-start-2 row-start-2" />
            <div className="w-2.5 h-2.5 bg-slate-900 rounded-full self-start col-start-3 row-start-3" />
            <div className="w-2.5 h-2.5 bg-slate-900 rounded-full self-end col-start-1 row-start-3" />
          </div>
          {/* FACE 3 */}
          <div className="absolute inset-0 bg-white border border-slate-300 rounded-xl p-2.5 flex justify-between shadow-md [backface-visibility:hidden] [transform:rotateY(-90deg)_translateZ(32px)]">
            <div className="w-2.5 h-2.5 bg-slate-900 rounded-full self-start" />
            <div className="w-2.5 h-2.5 bg-slate-900 rounded-full align-middle self-center" />
            <div className="w-2.5 h-2.5 bg-slate-900 rounded-full self-end" />
          </div>
          {/* FACE 4 */}
          <div className="absolute inset-0 bg-white border border-slate-300 rounded-xl p-2.5 grid grid-cols-2 gap-2 shadow-md [backface-visibility:hidden] [transform:rotateY(90deg)_translateZ(32px)]">
            <div className="w-2.5 h-2.5 bg-slate-900 rounded-full" />
            <div className="w-2.5 h-2.5 bg-slate-900 rounded-full" />
            <div className="w-2.5 h-2.5 bg-slate-900 rounded-full" />
            <div className="w-2.5 h-2.5 bg-slate-900 rounded-full" />
          </div>
        </div>
      </div>

      <button
        onClick={onRoll}
        disabled={disabled}
        className="px-6 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/20 disabled:opacity-40 disabled:cursor-not-allowed enabled:hover:scale-[1.03] transition-transform text-sm"
      >
        {label}
      </button>
    </div>
  );
}
