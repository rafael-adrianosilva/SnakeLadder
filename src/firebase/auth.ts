/** Helpers de autenticação (Firebase Auth: email/senha + Google OAuth). */
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { auth } from './config';
import { createUserProfileIfMissing } from './firestore';

const googleProvider = new GoogleAuthProvider();

/** Cadastro por email/senha. Cria o documento do usuário no Firestore. */
export async function registerWithEmail(
  email: string,
  password: string,
  displayName: string,
): Promise<User> {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName });
  await createUserProfileIfMissing(cred.user, displayName);
  return cred.user;
}

/** Login por email/senha. */
export async function loginWithEmail(email: string, password: string): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

/** Login com Google OAuth. Cria o perfil no Firestore se for o primeiro acesso. */
export async function loginWithGoogle(): Promise<User> {
  const cred = await signInWithPopup(auth, googleProvider);
  await createUserProfileIfMissing(cred.user, cred.user.displayName ?? 'Jogador');
  return cred.user;
}

export function logout(): Promise<void> {
  return signOut(auth);
}

/** Observa mudanças no estado de autenticação. Retorna a função de cancelamento. */
export function observeAuth(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

export function getCurrentUser(): User | null {
  return auth.currentUser;
}
