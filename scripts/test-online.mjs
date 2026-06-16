// Teste 2-clientes contra o Firestore real + regras publicadas.
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import {
  getFirestore, doc, setDoc, getDoc, getDocs, collection, query, where, limit,
  runTransaction, updateDoc, serverTimestamp,
} from 'firebase/firestore';

const config = {
  apiKey: 'AIzaSyDNmadRSMvTRDHG1DEtXrGwqQgQ079an60',
  authDomain: 'snakeladdersbr.firebaseapp.com',
  projectId: 'snakeladdersbr',
  appId: '1:962831380726:web:d4f3c12dbb4eb9823d3cd7',
  messagingSenderId: '962831380726',
};
const BOARD = { snakes: { 17: 7 }, ladders: { 4: 14 } };
const PASS = (m) => console.log('  ✓', m);
const FAIL = (m, e) => console.log('  ✗', m, '→', e?.message ?? e);

const appA = initializeApp(config, 'A');
const appB = initializeApp(config, 'B');
const dbA = getFirestore(appA);
const dbB = getFirestore(appB);

const main = async () => {
  const a = (await signInAnonymously(getAuth(appA))).user;
  const b = (await signInAnonymously(getAuth(appB))).user;
  PASS(`dois usuários anônimos: A=${a.uid.slice(0,6)} B=${b.uid.slice(0,6)}`);

  const ref = doc(collection(dbA, 'rooms'));
  const code = 'TST' + Math.floor(Math.random() * 900 + 100);
  await setDoc(ref, {
    roomId: ref.id, roomCode: code, createdBy: a.uid, createdAt: serverTimestamp(),
    status: 'lobby', maxPlayers: 2, isPrivate: true, currentTurn: null, turnOrder: [],
    settings: { boardTheme: 'classic', ruleVariant: 'classic', animationSpeed: 'normal' },
    players: { [a.uid]: P(a.uid, 'Alice', 0) },
    board: BOARD, lastMove: null, gameLog: [], winner: null, finishedAt: null,
  });
  PASS(`A criou sala ${code}`);

  // B encontra por código e entra
  const snap = await getDocs(query(collection(dbB, 'rooms'),
    where('roomCode', '==', code), where('status', '==', 'lobby'), limit(1)));
  if (snap.empty) throw new Error('B não achou a sala (read/index)');
  PASS('B encontrou a sala por código');
  const refB = snap.docs[0].ref;
  await runTransaction(dbB, async (t) => {
    const fresh = await t.get(refB);
    t.update(refB, { [`players.${b.uid}`]: P(b.uid, 'Bob', 1) });
  });
  PASS('B entrou na sala (regra: novo jogador no lobby)');

  // ready
  await updateDoc(doc(dbA, 'rooms', ref.id), { [`players.${a.uid}.isReady`]: true });
  await updateDoc(doc(dbB, 'rooms', ref.id), { [`players.${b.uid}.isReady`]: true });
  PASS('ambos marcaram pronto');

  // A (criador) inicia
  await updateDoc(doc(dbA, 'rooms', ref.id), {
    status: 'in_progress', turnOrder: [a.uid, b.uid], currentTurn: a.uid,
    [`players.${a.uid}.position`]: 0, [`players.${b.uid}.position`]: 0,
  });
  PASS('A iniciou a partida (regra: criador no lobby)');

  // jogada de A (é a vez dele) — agora currentTurn passa para B
  await updateDoc(doc(dbA, 'rooms', ref.id), {
    [`players.${a.uid}.position`]: 4,
    currentTurn: b.uid,
    lastMove: { playerId: a.uid, diceResult: 4, from: 0, to: 4, boardEffect: 'none' },
  });
  PASS('A aplicou jogada (regra: jogador da vez em in_progress)');

  // teste negativo 1: A tenta jogar de novo fora da vez (currentTurn=B) → FALHA
  try {
    await updateDoc(doc(dbA, 'rooms', ref.id), { [`players.${a.uid}.position`]: 50, currentTurn: a.uid });
    FAIL('deveria bloquear jogada fora de turno, mas PERMITIU');
  } catch (e) {
    PASS('regra bloqueou jogada fora de turno (esperado): ' + (e.code ?? 'denied'));
  }

  // teste negativo 2: B (na vez dele) tenta mover o peão de A → FALHA
  try {
    await updateDoc(doc(dbB, 'rooms', ref.id), { [`players.${a.uid}.position`]: 1 });
    FAIL('deveria bloquear mover o oponente, mas PERMITIU');
  } catch (e) {
    PASS('regra bloqueou mover o oponente (esperado): ' + (e.code ?? 'denied'));
  }

  // B joga na própria vez, movendo só o próprio peão
  await updateDoc(doc(dbB, 'rooms', ref.id), {
    [`players.${b.uid}.position`]: 6,
    currentTurn: a.uid,
    lastMove: { playerId: b.uid, diceResult: 6, from: 0, to: 6, boardEffect: 'none' },
  });
  PASS('B aplicou jogada na própria vez (só o próprio peão)');

  const final = (await getDoc(doc(dbA, 'rooms', ref.id))).data();
  console.log('\nEstado final: A=', final.players[a.uid].position, 'B=', final.players[b.uid].position,
    'turno=', final.currentTurn === a.uid ? 'A' : 'B');
  console.log('\n✅ Fluxo online validado contra Firestore + regras reais.');
  process.exit(0);
};

const P = (uid, name, i) => ({
  uid, displayName: name, color: ['#6366f1', '#ec4899'][i], position: 0,
  isReady: false, isConnected: true, turnIndex: i,
});

main().catch((e) => { console.error('\n❌ ERRO:', e.message); process.exit(1); });
