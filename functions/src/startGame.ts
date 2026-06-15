/**
 * Inicia a partida: define a ordem de turno e move a sala para in_progress.
 * Só o criador da sala pode iniciar, e todos os jogadores precisam estar prontos.
 */
import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';

export const startGame = functions.https.onCall(async (data, context) => {
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

  const turnOrder = await db.runTransaction(async (t) => {
    const snap = await t.get(roomRef);
    if (!snap.exists) {
      throw new functions.https.HttpsError('not-found', 'Sala não encontrada');
    }
    const room = snap.data() as FirebaseFirestore.DocumentData;

    if (room.createdBy !== uid) {
      throw new functions.https.HttpsError('permission-denied', 'Apenas o criador pode iniciar');
    }
    if (room.status !== 'lobby') {
      throw new functions.https.HttpsError('failed-precondition', 'Sala não está no lobby');
    }

    const players = Object.values(room.players) as any[];
    if (players.length < 2) {
      throw new functions.https.HttpsError('failed-precondition', 'Mínimo de 2 jogadores');
    }
    if (!players.every((p) => p.isReady)) {
      throw new functions.https.HttpsError('failed-precondition', 'Nem todos estão prontos');
    }

    // Sorteio da ordem de jogada (embaralhamento no servidor)
    const order = players.map((p) => p.uid);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }

    const playerUpdates: Record<string, unknown> = {};
    order.forEach((playerUid, idx) => {
      playerUpdates[`players.${playerUid}.turnIndex`] = idx;
      playerUpdates[`players.${playerUid}.position`] = 0;
    });

    t.update(roomRef, {
      status: 'in_progress',
      turnOrder: order,
      currentTurn: order[0],
      ...playerUpdates,
    });

    return order;
  });

  return { success: true, turnOrder };
});
