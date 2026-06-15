/** Constantes do jogo e tabuleiro padrão (Apêndice A do prompt mestre). */
import type { BoardConfig } from '../types/room.types';

export const DEFAULT_SNAKES: Record<number, number> = {
  17: 7,
  54: 34,
  62: 19,
  64: 60,
  87: 24,
  93: 73,
  95: 75,
  99: 78,
};

export const DEFAULT_LADDERS: Record<number, number> = {
  4: 14,
  9: 31,
  20: 38,
  28: 84,
  40: 59,
  51: 67,
  63: 81,
  71: 91,
};

export const DEFAULT_BOARD_CONFIG: BoardConfig = {
  snakes: DEFAULT_SNAKES,
  ladders: DEFAULT_LADDERS,
};

export const BOARD_SIZE = 100;
export const DICE_FACES = 6;
export const MAX_PLAYERS = 4;
export const MIN_PLAYERS = 2;
export const BOT_HEARTBEAT_INTERVAL = 5000; // ms
export const PLAYER_TIMEOUT_THRESHOLD = 15000; // ms
export const PLAYER_ABANDON_THRESHOLD = 60000; // ms
export const ROOM_CODE_LENGTH = 6;
export const CHAT_MAX_LENGTH = 200;
export const COINS_DAILY_BONUS = 50;

export const PLACEMENT_COINS = [100, 40, 20, 10] as const;

export const ANIMATION_SPEEDS = {
  slow: 300,
  normal: 150,
  fast: 75,
} as const;
