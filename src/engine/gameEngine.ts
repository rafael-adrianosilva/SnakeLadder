/** Lógica pura do jogo (sem UI). Regras das seções 4 e 5 do prompt mestre. */
import { DEFAULT_SNAKES, DEFAULT_LADDERS, BOARD_SIZE } from './boardConfig';

export type BoardEffect = 'snake' | 'ladder' | 'none';
export type RuleVariant = 'classic' | 'bounce';

export interface BoardConfig {
  snakes: Record<number, number>;
  ladders: Record<number, number>;
}

export const DEFAULT_BOARD: BoardConfig = {
  snakes: DEFAULT_SNAKES,
  ladders: DEFAULT_LADDERS,
};

export interface Player {
  id: string;
  name: string;
  color: string;
  position: number;
  isBot: boolean;
  difficulty?: 'easy' | 'medium' | 'hard';
}

/** Sorteia um dado de 6 faces. */
export function rollDice(): number {
  return Math.floor(Math.random() * 6) + 1;
}

/**
 * Converte uma casa (1..100) em coordenadas de grid (col, row) em serpentina.
 * row 0 = base do tabuleiro.
 */
export function getCellCoordinates(n: number): { col: number; row: number } {
  const row = Math.floor((n - 1) / 10);
  const col = row % 2 === 0 ? (n - 1) % 10 : 9 - ((n - 1) % 10);
  return { col, row };
}

/** Posição após mover o dado, antes de cobras/escadas. */
export function calculateLanding(
  from: number,
  dice: number,
  variant: RuleVariant = 'classic',
): number {
  const target = from + dice;
  if (target === BOARD_SIZE) return BOARD_SIZE;
  if (target > BOARD_SIZE) {
    return variant === 'bounce' ? BOARD_SIZE - (target - BOARD_SIZE) : from;
  }
  return target;
}

/** Aplica cobra/escada e retorna destino final + tipo de efeito. */
export function applyBoardEffects(
  position: number,
  board: BoardConfig,
): { position: number; effect: BoardEffect } {
  if (board.ladders[position] !== undefined) {
    return { position: board.ladders[position], effect: 'ladder' };
  }
  if (board.snakes[position] !== undefined) {
    return { position: board.snakes[position], effect: 'snake' };
  }
  return { position, effect: 'none' };
}

export interface MoveResult {
  /** Casas percorridas casa a casa (para animar o pulo do dado). */
  path: number[];
  /** Posição onde o dado parou (antes do efeito). */
  landed: number;
  /** Posição final (após cobra/escada). */
  final: number;
  effect: BoardEffect;
  won: boolean;
}

/** Resolve um turno completo a partir de uma posição e valor de dado. */
export function resolveMove(
  from: number,
  dice: number,
  board: BoardConfig,
  variant: RuleVariant = 'classic',
): MoveResult {
  const landed = calculateLanding(from, dice, variant);
  const path: number[] = [];
  for (let p = from + 1; p <= landed; p++) path.push(p);

  const { position: final, effect } = applyBoardEffects(landed, board);
  return { path, landed, final, effect, won: final === BOARD_SIZE };
}
