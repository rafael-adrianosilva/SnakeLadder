/**
 * Lógica de tabuleiro autoritativa do servidor.
 * O servidor é a autoridade final em partidas online (seção 3.3).
 */

export interface BoardConfig {
  snakes: { [head: number]: number };
  ladders: { [base: number]: number };
}

export type BoardEffect = 'snake' | 'ladder' | 'none';
export type RuleVariant = 'classic' | 'bounce' | 'double6';

export const BOARD_SIZE = 100;

export const DEFAULT_BOARD: BoardConfig = {
  snakes: { 17: 7, 54: 34, 62: 19, 64: 60, 87: 24, 93: 73, 95: 75, 99: 78 },
  ladders: { 4: 14, 9: 31, 20: 38, 28: 84, 40: 59, 51: 67, 63: 81, 71: 91 },
};

/**
 * Calcula a posição após mover `dice` casas a partir de `from`, antes de
 * aplicar cobras/escadas. Regra clássica: ultrapassar 100 não move; variante
 * `bounce`: volta o excesso.
 */
export function calculatePosition(
  from: number,
  dice: number,
  variant: RuleVariant = 'classic',
): number {
  const target = from + dice;
  if (target === BOARD_SIZE) return BOARD_SIZE;
  if (target > BOARD_SIZE) {
    if (variant === 'bounce') return BOARD_SIZE - (target - BOARD_SIZE);
    return from; // não move
  }
  return target;
}

/** Aplica o efeito de cobra/escada à posição, retornando destino e tipo. */
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

/** Sorteia um valor de dado justo no servidor (1–6). */
export function rollServerDice(): number {
  return Math.floor(Math.random() * 6) + 1;
}

/** Retorna o uid do próximo jogador na ordem de turno. */
export function getNextPlayer(turnOrder: string[], currentTurn: string): string {
  const idx = turnOrder.indexOf(currentTurn);
  return turnOrder[(idx + 1) % turnOrder.length];
}

/** Compara se duas datas caem no mesmo dia (fuso local do servidor). */
export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
