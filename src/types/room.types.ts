/** Modelo da coleção `rooms` e correlatos (seções 10 e 17 do prompt mestre). */
import type { Timestamp } from 'firebase/firestore';
import type { AvatarConfig } from './avatar.types';

export type RoomStatus = 'lobby' | 'countdown' | 'in_progress' | 'finished' | 'abandoned';
export type BoardTheme = 'classic' | 'forest' | 'space';
export type RuleVariant = 'classic' | 'bounce' | 'double6';
export type AnimationSpeed = 'slow' | 'normal' | 'fast';
export type BoardEffect = 'snake' | 'ladder' | 'none';

export interface RoomSettings {
  boardTheme: BoardTheme;
  ruleVariant: RuleVariant;
  animationSpeed: AnimationSpeed;
}

export interface BoardConfig {
  snakes: { [head: number]: number };
  ladders: { [base: number]: number };
}

export interface PlayerInRoom {
  uid: string;
  displayName: string;
  avatarConfig: AvatarConfig;
  position: number;
  isReady: boolean;
  isConnected: boolean;
  lastSeen: Timestamp;
  turnIndex: number;
  coinsEarned: number;
}

export interface LastMove {
  playerId: string;
  diceResult: number;
  from: number;
  to: number;
  boardEffect: BoardEffect;
  timestamp: Timestamp;
}

export interface GameLogEntry {
  type: 'move' | 'join' | 'leave' | 'system';
  playerId: string;
  diceResult?: number;
  from?: number;
  to?: number;
  boardEffect?: BoardEffect;
  timestamp: number;
}

export interface CoinDistribution {
  playerId: string;
  coins: number;
  placement: number;
}

export interface RoomDocument {
  roomId: string;
  roomCode: string;
  createdBy: string;
  createdAt: Timestamp;
  status: RoomStatus;
  maxPlayers: 2 | 3 | 4;
  isPrivate: boolean;
  currentTurn: string | null;
  turnOrder: string[];

  settings: RoomSettings;
  players: { [uid: string]: PlayerInRoom };
  board: BoardConfig;

  lastMove: LastMove | null;
  gameLog: GameLogEntry[];
  winner: string | null;
  finishedAt: Timestamp | null;
  coinsDistribution?: CoinDistribution[];
}

export interface ChatMessage {
  authorId: string;
  authorName: string;
  text: string;
  type: 'text' | 'emoji' | 'system';
  createdAt: Timestamp;
}

export interface CreateRoomConfig {
  maxPlayers: 2 | 3 | 4;
  isPrivate: boolean;
  settings: RoomSettings;
}
