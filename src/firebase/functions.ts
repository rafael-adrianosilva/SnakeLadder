/** Chamadas tipadas às Cloud Functions (seções 8.6, 12.4 do prompt mestre). */
import { httpsCallable } from 'firebase/functions';
import { functions } from './config';

// ─── validateMove ─────────────────────────────────────────────────────────
export interface ValidateMoveRequest {
  roomId: string;
  playerId: string;
  /** Resultado pretendido do dado (servidor valida/recalcula). */
  diceResult: number;
}
export interface ValidateMoveResponse {
  success: boolean;
  newPosition: number;
}

/**
 * Em produção o cliente apenas envia a intenção e o servidor é a autoridade
 * (game authority — seção 3.3). O dado é gerado/validado no servidor.
 */
export const validateMove = httpsCallable<ValidateMoveRequest, ValidateMoveResponse>(
  functions,
  'validateMove',
);

// ─── startGame ──────────────────────────────────────────────────────────────
export interface StartGameRequest {
  roomId: string;
}
export interface StartGameResponse {
  success: boolean;
  turnOrder: string[];
}
export const startGame = httpsCallable<StartGameRequest, StartGameResponse>(
  functions,
  'startGame',
);

// ─── purchaseItem ─────────────────────────────────────────────────────────
export interface PurchaseItemRequest {
  itemId: string;
}
export interface PurchaseItemResponse {
  success: boolean;
  itemId: string;
}
export const purchaseItem = httpsCallable<PurchaseItemRequest, PurchaseItemResponse>(
  functions,
  'purchaseItem',
);
