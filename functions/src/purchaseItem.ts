/**
 * Compra de itens de avatar com moedas (seção 12.4).
 * Roda no servidor para que o saldo não possa ser manipulado pelo cliente.
 */
import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';

interface AvatarItem {
  id: string;
  unlockType: 'free' | 'coins' | 'achievement' | 'level';
  cost?: number;
}

export const purchaseItem = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Login necessário');
  }

  const { itemId } = data ?? {};
  if (typeof itemId !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'itemId inválido');
  }

  const uid = context.auth.uid;
  const db = admin.firestore();

  // Catálogo de itens em /config/items (read-only para clientes)
  const itemsSnap = await db.doc('config/items').get();
  const items = (itemsSnap.data()?.items ?? []) as AvatarItem[];
  const item = items.find((i) => i.id === itemId);

  if (!item) {
    throw new functions.https.HttpsError('not-found', 'Item não encontrado');
  }
  if (item.unlockType !== 'coins' || typeof item.cost !== 'number') {
    throw new functions.https.HttpsError('invalid-argument', 'Item não comprável com moedas');
  }

  await db.runTransaction(async (t) => {
    const userRef = db.doc(`users/${uid}`);
    const userSnap = await t.get(userRef);
    const user = userSnap.data();
    if (!user) {
      throw new functions.https.HttpsError('not-found', 'Usuário não encontrado');
    }
    if ((user.unlockedItems ?? []).includes(itemId)) {
      throw new functions.https.HttpsError('already-exists', 'Item já desbloqueado');
    }
    if ((user.coins ?? 0) < item.cost!) {
      throw new functions.https.HttpsError('resource-exhausted', 'Moedas insuficientes');
    }

    t.update(userRef, {
      coins: admin.firestore.FieldValue.increment(-item.cost!),
      unlockedItems: admin.firestore.FieldValue.arrayUnion(itemId),
    });
  });

  return { success: true, itemId };
});
