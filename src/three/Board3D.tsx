import { useMemo } from 'react';
import * as THREE from 'three';
import { RoundedBox } from '@react-three/drei';
import { DEFAULT_SNAKES, DEFAULT_LADDERS } from '../engine/boardConfig';
import { cellToWorld, numberTexture, tileColor, TILE, TILE_H } from './boardLayout';

export interface PawnSpec {
  cell: number;
  color: string;
}

interface Board3DProps {
  pawns?: PawnSpec[];
}

/** Tabuleiro 3D completo: blocos numerados, escadas, cobras e peões. */
export default function Board3D({ pawns = DEFAULT_PAWNS }: Board3DProps) {
  const cells = useMemo(() => Array.from({ length: 100 }, (_, i) => i + 1), []);

  return (
    <group>
      {/* Base/moldura do tabuleiro */}
      <RoundedBox
        args={[10.6, 0.5, 10.6]}
        radius={0.25}
        smoothness={4}
        position={[0, -0.12, 0]}
        receiveShadow
        castShadow
      >
        <meshStandardMaterial color="#6b4f8a" roughness={0.6} metalness={0.1} />
      </RoundedBox>

      {cells.map((n) => (
        <Tile key={n} n={n} />
      ))}

      {Object.entries(DEFAULT_LADDERS).map(([base, top]) => (
        <Ladder key={`l-${base}`} base={Number(base)} top={top} />
      ))}

      {Object.entries(DEFAULT_SNAKES).map(([head, tail], i) => (
        <Snake key={`s-${head}`} head={Number(head)} tail={tail} index={i} />
      ))}

      {pawns.map((p, i) => (
        <Pawn key={`p-${i}`} cell={p.cell} color={p.color} offset={i} />
      ))}
    </group>
  );
}

const DEFAULT_PAWNS: PawnSpec[] = [
  { cell: 1, color: '#ef4444' },
  { cell: 14, color: '#3b82f6' },
  { cell: 38, color: '#22c55e' },
  { cell: 67, color: '#eab308' },
  { cell: 84, color: '#a855f7' },
];

// ─── Casa ────────────────────────────────────────────────────────────────
function Tile({ n }: { n: number }) {
  const pos = cellToWorld(n);
  const isLadder = DEFAULT_LADDERS[n] !== undefined;
  const isSnake = DEFAULT_SNAKES[n] !== undefined;
  const color = isLadder ? '#bbf7d0' : isSnake ? '#fecdd3' : tileColor(n);
  const tex = useMemo(() => numberTexture(n), [n]);

  return (
    <group position={[pos.x, 0, pos.z]}>
      <RoundedBox
        args={[TILE, TILE_H, TILE]}
        radius={0.09}
        smoothness={4}
        position={[0, TILE_H / 2, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={color} roughness={0.55} metalness={0.05} />
      </RoundedBox>
      {/* Número impresso no topo */}
      <mesh position={[0, TILE_H + 0.001, 0.04]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.62, 0.62]} />
        <meshBasicMaterial map={tex} transparent />
      </mesh>
    </group>
  );
}

// ─── Escada ────────────────────────────────────────────────────────────────
function Ladder({ base, top }: { base: number; top: number }) {
  const a = cellToWorld(base);
  const b = cellToWorld(top);
  const dir = new THREE.Vector3(b.x - a.x, 0, b.z - a.z);
  const length = dir.length();
  const angle = Math.atan2(dir.x, dir.z);
  const mid = new THREE.Vector3((a.x + b.x) / 2, 0.42, (a.z + b.z) / 2);
  const rungCount = Math.max(2, Math.round(length / 0.42));

  const wood = '#d08a3a';
  const woodLight = '#f0b75e';

  return (
    <group position={[mid.x, mid.y, mid.z]} rotation={[0, angle, 0]}>
      {/* Trilhos */}
      {[-0.2, 0.2].map((x) => (
        <mesh key={x} position={[x, 0, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, length + 0.2, 10]} />
          <meshStandardMaterial color={wood} roughness={0.5} metalness={0.05} />
        </mesh>
      ))}
      {/* Degraus */}
      {Array.from({ length: rungCount }).map((_, i) => {
        const z = -length / 2 + (length / (rungCount - 1 || 1)) * i;
        return (
          <mesh key={i} position={[0, 0, z]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.045, 0.045, 0.5, 8]} />
            <meshStandardMaterial color={woodLight} roughness={0.45} metalness={0.05} />
          </mesh>
        );
      })}
    </group>
  );
}

// ─── Cobra ────────────────────────────────────────────────────────────────
const SNAKE_COLORS = ['#22c55e', '#06b6d4', '#f97316', '#ec4899', '#8b5cf6', '#84cc16', '#ef4444', '#14b8a6'];

function Snake({ head, tail, index }: { head: number; tail: number; index: number }) {
  const color = SNAKE_COLORS[index % SNAKE_COLORS.length];

  const { geometry, headPos, eyeDir } = useMemo(() => {
    const h = cellToWorld(head).setY(0.5);
    const t = cellToWorld(tail).setY(0.35);
    const along = new THREE.Vector3().subVectors(t, h);
    const perp = new THREE.Vector3(-along.z, 0, along.x).normalize();
    const amp = 0.5;

    const p1 = new THREE.Vector3().lerpVectors(h, t, 0.33).addScaledVector(perp, amp).setY(0.55);
    const p2 = new THREE.Vector3().lerpVectors(h, t, 0.66).addScaledVector(perp, -amp).setY(0.45);
    const curve = new THREE.CatmullRomCurve3([h, p1, p2, t]);
    const geo = new THREE.TubeGeometry(curve, 80, 0.14, 10, false);
    const dir = new THREE.Vector3().subVectors(h, p1).normalize();
    return { geometry: geo, headPos: h, eyeDir: dir };
  }, [head, tail]);

  // base para orientar os olhos
  const side = new THREE.Vector3(-eyeDir.z, 0, eyeDir.x).normalize();

  return (
    <group>
      <mesh geometry={geometry} castShadow>
        <meshStandardMaterial color={color} roughness={0.35} metalness={0.1} />
      </mesh>
      {/* Cabeça */}
      <group position={[headPos.x, headPos.y, headPos.z]}>
        <mesh castShadow>
          <sphereGeometry args={[0.24, 24, 24]} />
          <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
        </mesh>
        {/* Olhos */}
        {[1, -1].map((s) => (
          <group
            key={s}
            position={[
              eyeDir.x * 0.12 + side.x * 0.12 * s,
              0.12,
              eyeDir.z * 0.12 + side.z * 0.12 * s,
            ]}
          >
            <mesh>
              <sphereGeometry args={[0.07, 16, 16]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
            <mesh position={[eyeDir.x * 0.05, 0.01, eyeDir.z * 0.05]}>
              <sphereGeometry args={[0.035, 12, 12]} />
              <meshStandardMaterial color="#1a1a1a" />
            </mesh>
          </group>
        ))}
        {/* Língua */}
        <mesh position={[eyeDir.x * 0.26, -0.02, eyeDir.z * 0.26]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.03, 0.18, 8]} />
          <meshStandardMaterial color="#e11d48" />
        </mesh>
      </group>
    </group>
  );
}

// ─── Peão ────────────────────────────────────────────────────────────────
function Pawn({ cell, color, offset }: { cell: number; color: string; offset: number }) {
  const pos = cellToWorld(cell);
  const dx = ((offset % 2) - 0.5) * 0.28;
  const dz = (Math.floor(offset / 2) - 0.5) * 0.28;
  const y = TILE_H;

  return (
    <group position={[pos.x + dx, y, pos.z + dz]}>
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

function Glossy({ color }: { color: string }) {
  return <meshStandardMaterial color={color} roughness={0.16} metalness={0.05} />;
}
