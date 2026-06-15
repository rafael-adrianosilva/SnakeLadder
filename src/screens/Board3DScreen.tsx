import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Board3D from '../three/Board3D';
import { useGameStore } from '../store/gameStore';

export default function Board3DScreen() {
  const goHome = useGameStore((s) => s.goHome);

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-slate-200 to-slate-400">
      {/* Overlay UI */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 pointer-events-none">
        <button
          onClick={goHome}
          className="pointer-events-auto p-2.5 rounded-xl bg-white/80 backdrop-blur hover:bg-white shadow-lg text-slate-700 transition-colors"
          aria-label="Voltar"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="px-4 py-2 rounded-xl bg-white/80 backdrop-blur shadow-lg text-slate-700 text-sm font-bold">
          Tabuleiro 3D — Mockup
        </div>
        <div className="w-10" />
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 px-4 py-2 rounded-full bg-slate-900/70 text-white text-xs">
        Arraste para girar · scroll para zoom
      </div>

      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [9, 10, 12], fov: 36 }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={['#cdd7ea']} />
        <fog attach="fog" args={['#cdd7ea', 22, 38]} />

        {/* Iluminação suave */}
        <ambientLight intensity={0.55} />
        <hemisphereLight args={['#ffffff', '#9bb0c9', 0.5]} />
        <directionalLight
          position={[8, 14, 6]}
          intensity={1.4}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={1}
          shadow-camera-far={40}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
          shadow-bias={-0.0004}
        />

        {/* Luz de preenchimento extra para realçar o brilho dos peões */}
        <pointLight position={[-6, 6, -4]} intensity={0.4} color="#a5b4fc" />

        <Suspense fallback={null}>
          <Board3D />
        </Suspense>

        {/* Sombra de contato suave e realista */}
        <ContactShadows
          position={[0, -0.36, 0]}
          opacity={0.45}
          scale={16}
          blur={2.4}
          far={6}
          resolution={1024}
          color="#1e293b"
        />

        <OrbitControls
          target={[0, 0, 0]}
          enablePan={false}
          minDistance={8}
          maxDistance={26}
          minPolarAngle={0.2}
          maxPolarAngle={Math.PI / 2.2}
          autoRotate
          autoRotateSpeed={0.6}
        />
      </Canvas>

      <noscript />
      <Spinner />
    </div>
  );
}

/** Spinner exibido só enquanto o WebGL não montou (fora do Canvas). */
function Spinner() {
  return (
    <div className="absolute inset-0 -z-10 flex items-center justify-center text-slate-500">
      <Loader2 className="w-8 h-8 animate-spin" />
    </div>
  );
}
