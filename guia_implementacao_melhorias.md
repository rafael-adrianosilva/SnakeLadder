# Guia de Implementação: Melhorias Visuais e de Jogabilidade

Este guia descreve as alterações necessárias nos arquivos do projeto para implementar as 5 melhorias selecionadas:
1. **Ritmo de Turno da IA (Bot)**
2. **Pulo Parabólico (Arco) 3D nos Peões**
3. **Dado em CSS 3D Rotativo**
4. **Efeitos Sonoros Sintetizados (Web Audio API)**
5. **Destaque do Turno Ativo no HUD**

---

## 🔊 Passo 1: Criando o Sintetizador de Áudio (Web Audio API)

Como não temos arquivos de áudio locais, usaremos a API nativa do navegador para sintetizar frequências sonoras em tempo real de forma leve e direta.

Crie o arquivo `src/utils/soundSynthesizer.ts`:

```typescript
class SoundSynthesizer {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
  }

  /** Efeito sonoro simulando o dado quicando */
  playDiceRoll() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  /** Som curto de pulo a cada casa percorrida */
  playJump() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(520, this.ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  }

  /** Arpejo alegre ao subir escadas */
  playLadder() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = [261.63, 329.63, 392.00, 523.25]; // Acorde Dó Maior (C4, E4, G4, C5)

    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.09);

      gain.gain.setValueAtTime(0.15, now + idx * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.09 + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now + idx * 0.09);
      osc.stop(now + idx * 0.09 + 0.2);
    });
  }

  /** Efeito de descida rápida e decepcionante ao cair na cobra */
  playSnake() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.linearRampToValueAtTime(45, now + 0.45);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.005, now + 0.45);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(now + 0.45);
  }

  /** Fanfarra de vitória */
  playVictory() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.2, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.6);
    });
  }
}

export const sound = new SoundSynthesizer();
```

---

## 🏃 Passo 2: Pulo Parabólico nos Peões 3D

Substituiremos a lógica de deslizamento linear simples do peão por uma interpolação de movimento tridimensional que aplica uma força vertical (arco seno) durante os passos.

Modifique o componente `Pawn` dentro de `src/three/Board3D.tsx`:

```typescript
// Substituir a função Pawn existente por:
function Pawn({ cell, color, offset }: { cell: number; color: string; offset: number }) {
  const ref = useRef<THREE.Group>(null);
  const dx = ((offset % 2) - 0.5) * 0.28;
  const dz = (Math.floor(offset / 2) - 0.5) * 0.28;
  const target = useMemo(() => cellToWorld(cell), [cell]);

  const lastCell = useRef(cell);
  const startX = useRef(target.x + dx);
  const startZ = useRef(target.z + dz);
  const progress = useRef(1); // 1 significa posicionado na casa final

  // Reinicia a animação quando a casa do peão muda
  if (cell !== lastCell.current) {
    if (ref.current) {
      startX.current = ref.current.position.x;
      startZ.current = ref.current.position.z;
    }
    lastCell.current = cell;
    progress.current = 0;
  }

  useFrame((_, delta) => {
    const g = ref.current;
    if (!g) return;

    if (progress.current < 1) {
      // Ajusta o progresso de acordo com o intervalo entre passos (160ms = ~6.25 de velocidade)
      progress.current = Math.min(1, progress.current + delta * 6.25);

      // Interpolação linear nos eixos X e Z (plano horizontal do tabuleiro)
      g.position.x = THREE.MathUtils.lerp(startX.current, target.x + dx, progress.current);
      g.position.z = THREE.MathUtils.lerp(startZ.current, target.z + dz, progress.current);

      // Pulo em arco (parábola) adicionado ao eixo Y (altura)
      const jumpHeight = 0.42;
      g.position.y = TILE_H + Math.sin(progress.current * Math.PI) * jumpHeight;
    } else {
      // Posição final estabilizada
      g.position.x = target.x + dx;
      g.position.z = target.z + dz;
      g.position.y = TILE_H;
    }
  });

  return (
    <group ref={ref} position={[target.x + dx, TILE_H, target.z + dz]}>
      <mesh position={[0, 0.07, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.26, 0.14, 24]} />
        <Glossy color={color} />
      </mesh>
      <mesh position={[0, 0.2, 0]} castShadow scale={[1, 0.6, 1]}>
        <sphereGeometry args={[0.18, 24, 24]} />
        <Glossy color={color} />
      </mesh>
      <mesh position={[0, 0.42, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.16, 0.34, 24]} />
        <Glossy color={color} />
      </mesh>
      <mesh position={[0, 0.66, 0]} castShadow>
        <sphereGeometry args={[0.15, 24, 24]} />
        <Glossy color={color} />
      </mesh>
    </group>
  );
}
```

---

## 🎲 Passo 3: Criando o Dado Rotativo 3D em CSS

Substituiremos a caixa plana com texto unicode por um dado 3D texturizado em CSS que executa giros de rolagem reais nos eixos X e Y.

Substitua o arquivo `src/components/Dice.tsx`:

```typescript
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
```

---

## ⏰ Passo 4: Ajustando Ritmo e Integrando Efeitos Sonoros

Integraremos o ritmo artificial para o turno do Bot (evitando saltos automáticos instantâneos) e acionaremos as chamadas de som sintetizado nos loops do motor de jogo.

Substitua a função `playTurn` em `src/store/gameStore.ts` por:

```typescript
// 1. Importar o sintetizador de som no topo de src/store/gameStore.ts:
// import { sound } from '../utils/soundSynthesizer';

  async function playTurn(diceValue: number) {
    const { players, currentIndex, board, variant } = get();
    const player = players[currentIndex];

    // Animação de rolagem de dados com som rítmico
    set({ phase: 'rolling' });
    for (let i = 0; i < 10; i++) {
      set({ diceFace: Math.floor(Math.random() * 6) + 1 });
      sound.playDiceRoll(); // Toca o som do dado girando
      await sleep(75);
    }
    set({ dice: diceValue, diceFace: diceValue });
    await sleep(350);

    // Movimento casa a casa
    set({ phase: 'moving' });
    const result = resolveMove(player.position, diceValue, board, variant);

    if (result.path.length === 0) {
      get().showToast(`${player.name} tirou ${diceValue} e passou de 100 — não move.`);
    }

    // Peão saltitando casa por casa
    for (const step of result.path) {
      setPlayerPosition(player.id, step);
      sound.playJump(); // Toca o som a cada pulo de casa
      await sleep(180);
    }

    // Efeitos especiais de cobra/escada
    if (result.effect !== 'none') {
      await sleep(350);
      setPlayerPosition(player.id, result.final);
      set({ lastEffect: result.effect });

      const isLadder = result.effect === 'ladder';
      if (isLadder) {
        sound.playLadder(); // Toca som alegre de subida
      } else {
        sound.playSnake();  // Toca som dramático de queda
      }

      const verb = isLadder ? 'subiu por uma escada 🪜' : 'caiu numa cobra 🐍';
      pushLog(`${player.name} ${verb} (${result.landed} → ${result.final}).`);
      await sleep(600);
      set({ lastEffect: null });
    } else if (result.path.length > 0) {
      pushLog(`${player.name} foi para a casa ${result.final}.`);
    }

    // Declaração de vitória e fim de jogo
    if (result.won) {
      sound.playVictory(); // Toca som de vitória
      set({ winner: player, screen: 'victory', phase: 'idle' });
      return;
    }

    // Transição de turnos
    const next = (currentIndex + 1) % players.length;
    set({ currentIndex: next, phase: 'idle', dice: null });
    
    // Inicia o turno do Bot se aplicável
    maybeRunBot();
  }
```

---

## 🌟 Passo 5: Destaque do Turno Ativo no HUD

Aprimorar os cartões dos jogadores para dar um realce vívido e animado sobre quem está jogando na rodada atual.

Substitua o arquivo `src/components/PlayerHUD.tsx` por:

```typescript
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
```
