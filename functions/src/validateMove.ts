/**
 * Cloud Function validateMove — autoridade de jogada no servidor (seção 8.6).
 *
 * O cliente envia apenas a intenção de jogar. O servidor:
 *   1. verifica autenticação e turno;
 *   2. sorteia o dado (anti-cheat: o resultado NÃO vem do cliente);
 *   3. calcula a nova posição e aplica cobras/escadas;
 *   4. atualiza o Firestore e passa o turno;
 *   5. distribui moedas ao atingir a casa 100.
 */
import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import {
  applyBoardEffects,
  calculatePosition,
  getNextPlayer,
  rollServerDice,
  type BoardConfig,
  type RuleVariant,
} from './boardLogic';
import { handleVictory } from './handleVictory';

const RATE_LIMIT_MS = 1000; // 1 chamada/seg por usuário (seção 21.2)

export const validateMove = functions.https.onCall(async (data, context) => {
  // 1. Autenticação
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Login necessário');
  }
  const uid = context.auth.uid;
  const { roomId } = data ?? {};
  if (typeof roomId !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'roomId inválido');
  }

  const db = admin.firestore();
  const roomRef = db.doc(`rooms/${roomId}`);

  const result = await db.runTransaction(async (t) => {
    const roomSnap = await t.get(roomRef);
    if (!roomSnap.exists) {
      throw new functions.https.HttpsError('not-found', 'Sala não encontrada');
    }
    const room = roomSnap.data() as FirebaseFirestore.DocumentData;

    // 2. Estado e turno
    if (room.status !== 'in_progress') {
      throw new functions.https.HttpsError('failed-precondition', 'Partida não está em andamento');
    }
    if (room.currentTurn !== uid) {
      throw new functions.https.HttpsError('permission-denied', 'Não é seu turno');
    }

    // Rate limiting por jogador
    const lastMoveTs = room.lastMove?.timestamp?.toMillis?.() ?? 0;
    if (room.lastMove?.playerId === uid && Date.now() - lastMoveTs < RATE_LIMIT_MS) {
      throw new functions.https.HttpsError('resource-exhausted', 'Aguarde antes de jogar de novo');
    }

    // 3. Dado gerado no servidor
    const diceResult = rollServerDice();

    const player = room.players[uid];
    const board = room.board as BoardConfig;
    const variant: RuleVariant = room.settings?.ruleVariant ?? 'classic';

    // 4. Nova posição + efeitos de tabuleiro
    const moved = calculatePosition(player.position, diceResult, variant);
    const { position: finalPosition, effect } = applyBoardEffects(moved, board);

    const isWin = finalPosition === 100;
    const nextTurn = isWin ? room.currentTurn : getNextPlayer(room.turnOrder, uid);

    t.update(roomRef, {
      [`players.${uid}.position`]: finalPosition,
      currentTurn: nextTurn,
      lastMove: {
        playerId: uid,
        diceResult,
        from: player.position,
        to: finalPosition,
        boardEffect: effect,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      },
      gameLog: admin.firestore.FieldValue.arrayUnion({
        type: 'move',
        playerId: uid,
        diceResult,
        from: player.position,
        to: finalPosition,
        boardEffect: effect,
        timestamp: Date.now(),
      }),
    });

    return { diceResult, finalPosition, isWin, room };
  });

  // 5. Vitória: distribuição de moedas fora da transação (lê vários usuários)
  if (result.isWin) {
    await handleVictory(roomId, uid);
  }

  return { success: true, newPosition: result.finalPosition, diceResult: result.diceResult };
});
