/**
 * Ponto de entrada das Cloud Functions do projeto snakeladdersbr.
 * Inicializa o Admin SDK uma única vez e reexporta cada função.
 */
import * as admin from 'firebase-admin';

admin.initializeApp();

export { validateMove } from './validateMove';
export { startGame } from './startGame';
export { purchaseItem } from './purchaseItem';
export { cleanupRooms } from './cleanupRooms';
