import { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import Board3D, { type PawnSpec } from '../three/Board3D';
import type { BoardConfig, Player } from '../engine/gameEngine';

interface Props {
  players: Player[];
  board: BoardConfig;
}

/**
 * Tabuleiro 3D usado durante a partida (substitui o tabuleiro 2D). Os peões
 * seguem as posições reais dos jogadores; o deslizamento casa a casa é feito
 * dentro do próprio peão (ver `Pawn` em Board3D), então ao mudar a posição
 * casa a casa (engine local ou animação do online) o boneco "anda".
 */
export default function GameBoard3D({ players, board }: Props) {
  const pawns: PawnSpec[] = useMemo(
    // position 0 = ainda no início; mostra o peão sobre a casa 1.
    () => players.map((p) => ({ cell: Math.max(1, p.position), color: p.color })),
    [players],
  );

  return (
    <div className="relative w-full aspect-square rounded-2xl overflow-hidden border border-slate-700 shadow-2xl bg-gradient-to-b from-slate-300 to-slate-500">
      <Canvas shadows dpr={[1, 2]} camera={{ position: [3, 13, 11], fov: 35 }} gl={{ antialias: true }}>
        <color attach="background" args={['#cdd7ea']} />

        <ambientLight intensity={0.55} />
        <hemisphereLight args={['#ffffff', '#9bb0c9', 0.5]} />
        <directionalLight
          position={[8, 14, 6]}
          intensity={1.4}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-near={1}
          shadow-camera-far={40}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
          shadow-bias={-0.0004}
        />
        <pointLight position={[-6, 6, -4]} intensity={0.4} color="#a5b4fc" />

        <Suspense fallback={null}>
          <Board3D pawns={pawns} board={board} />
        </Suspense>

        <ContactShadows
          position={[0, -0.36, 0]}
          opacity={0.45}
          scale={16}
          blur={2.4}
          far={6}
          resolution={512}
          color="#1e293b"
        />

        <OrbitControls
          target={[0, 0, 0]}
          enablePan={false}
          minDistance={9}
          maxDistance={26}
          minPolarAngle={0.15}
          maxPolarAngle={Math.PI / 2.3}
        />
      </Canvas>
    </div>
  );
}
