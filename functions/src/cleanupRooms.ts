/**
 * Manutenção agendada (Cloud Scheduler):
 *   - marca como `abandoned` salas em andamento sem atividade há muito tempo;
 *   - remove salas finalizadas/abandonadas antigas e seu chat (seção 21.4).
 */
import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';

const ABANDON_AFTER_MS = 10 * 60 * 1000; // 10 min sem jogadas
const DELETE_AFTER_MS = 24 * 60 * 60 * 1000; // 24h após encerrar

export const cleanupRooms = functions.pubsub
  .schedule('every 30 minutes')
  .timeZone('America/Sao_Paulo')
  .onRun(async () => {
    const db = admin.firestore();
    const now = Date.now();

    // 1. Salas ativas sem atividade → abandoned
    const activeSnap = await db
      .collection('rooms')
      .where('status', 'in', ['lobby', 'countdown', 'in_progress'])
      .get();

    const abandonBatch = db.batch();
    activeSnap.forEach((docSnap) => {
      const room = docSnap.data();
      const lastTs =
        room.lastMove?.timestamp?.toMillis?.() ?? room.createdAt?.toMillis?.() ?? now;
      if (now - lastTs > ABANDON_AFTER_MS) {
        abandonBatch.update(docSnap.ref, { status: 'abandoned' });
      }
    });
    await abandonBatch.commit();

    // 2. Salas encerradas/abandonadas antigas → deletar (inclui subcoleção messages)
    const staleSnap = await db
      .collection('rooms')
      .where('status', 'in', ['finished', 'abandoned'])
      .get();

    for (const docSnap of staleSnap.docs) {
      const room = docSnap.data();
      const endTs = room.finishedAt?.toMillis?.() ?? room.createdAt?.toMillis?.() ?? 0;
      if (now - endTs > DELETE_AFTER_MS) {
        const messages = await docSnap.ref.collection('messages').get();
        const batch = db.batch();
        messages.forEach((m) => batch.delete(m.ref));
        batch.delete(docSnap.ref);
        await batch.commit();
      }
    }

    return null;
  });
