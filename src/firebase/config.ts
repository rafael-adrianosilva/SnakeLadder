/**
 * Inicialização do Firebase (Web SDK v9 modular).
 *
 * Projeto Firebase:
 *   - Nome:    snakeladders
 *   - ID:      snakeladdersbr
 *   - Número:  962831380726   (messagingSenderId)
 *
 * Os valores `apiKey` e `appId` são públicos (não são segredos), mas variam
 * por app web registrado no console. Cada campo tem um default fixo para o
 * app `snakeladdersbr`; as variáveis de ambiente (arquivo .env, ver
 * .env.example) servem apenas para sobrescrever esses defaults. Isso garante
 * que o build funcione mesmo que o ambiente (ex.: Vercel) não defina as vars.
 */
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, type Auth } from 'firebase/auth';
import {
  getFirestore,
  connectFirestoreEmulator,
  type Firestore,
} from 'firebase/firestore';
import { getStorage, connectStorageEmulator, type FirebaseStorage } from 'firebase/storage';
import {
  getFunctions,
  connectFunctionsEmulator,
  type Functions,
} from 'firebase/functions';
import { getDatabase, connectDatabaseEmulator, type Database } from 'firebase/database';

// Lê uma variável VITE_*, removendo aspas e espaços que às vezes vêm colados
// por engano ao definir o valor no painel da Vercel/host. Retorna undefined
// quando vazia, para que o operador `??` caia no default abaixo.
const env = (value: string | undefined): string | undefined => {
  const clean = value?.trim().replace(/^['"]|['"]$/g, '').trim();
  return clean ? clean : undefined;
};

const firebaseConfig = {
  apiKey: env(import.meta.env.VITE_FIREBASE_API_KEY) ?? 'AIzaSyDNmadRSMvTRDHG1DEtXrGwqQgQ079an60',
  authDomain: env(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN) ?? 'snakeladdersbr.firebaseapp.com',
  projectId: env(import.meta.env.VITE_FIREBASE_PROJECT_ID) ?? 'snakeladdersbr',
  storageBucket:
    env(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET) ?? 'snakeladdersbr.firebasestorage.app',
  messagingSenderId: env(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID) ?? '962831380726',
  appId:
    env(import.meta.env.VITE_FIREBASE_APP_ID) ??
    '1:962831380726:web:d4f3c12dbb4eb9823d3cd7',
  // Realtime Database (usado para presença — ver seção 8.5 do prompt mestre)
  databaseURL:
    env(import.meta.env.VITE_FIREBASE_DATABASE_URL) ??
    'https://snakeladdersbr-default-rtdb.firebaseio.com',
};

// Evita reinicializar em hot-reload do Vite.
export const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);
export const functions: Functions = getFunctions(app, 'us-central1');
export const rtdb: Database = getDatabase(app);

// ─── Emuladores locais (firebase emulators:start) ─────────────────────────
// Ativa quando VITE_USE_EMULATORS=true, conectando aos portos definidos em
// firebase.json.
if (import.meta.env.VITE_USE_EMULATORS === 'true') {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
  connectStorageEmulator(storage, '127.0.0.1', 9199);
  connectFunctionsEmulator(functions, '127.0.0.1', 5001);
  connectDatabaseEmulator(rtdb, '127.0.0.1', 9000);
}
