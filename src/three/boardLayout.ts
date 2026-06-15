/** Helpers de layout 3D do tabuleiro: mapeia casas (1..100) para coordenadas
 *  de mundo e gera texturas de número via canvas (sem dependência de fonte
 *  externa). */
import * as THREE from 'three';
import { getCellCoordinates } from '../engine/gameEngine';

export const CELL = 1; // tamanho de uma casa em unidades de mundo
export const TILE = 0.9; // tamanho visível do bloco (deixa um "gap")
export const TILE_H = 0.22; // altura do bloco
export const BOARD_HALF = 4.5; // (10-1)/2 para centralizar

/** Coordenada (x, z) do centro de uma casa. y é a altura do topo do bloco. */
export function cellToWorld(n: number): THREE.Vector3 {
  const { col, row } = getCellCoordinates(n);
  return new THREE.Vector3((col - BOARD_HALF) * CELL, TILE_H, (row - BOARD_HALF) * CELL);
}

/** Paleta clara e divertida, em xadrez suave. */
export function tileColor(n: number): string {
  const { col, row } = getCellCoordinates(n);
  const even = (col + row) % 2 === 0;
  return even ? '#f8f4e9' : '#e7ddc6';
}

const texCache = new Map<number, THREE.CanvasTexture>();

/** Textura de um número desenhada num canvas, cacheada por valor. */
export function numberTexture(n: number): THREE.CanvasTexture {
  const cached = texCache.get(n);
  if (cached) return cached;

  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = '#3a2f1a';
  ctx.font = 'bold 64px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(n), size / 2, size / 2 + 4);

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  texCache.set(n, tex);
  return tex;
}
