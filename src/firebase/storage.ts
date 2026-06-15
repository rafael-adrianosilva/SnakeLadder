/** Helpers de Firebase Storage: upload de avatares de usuário. */
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from 'firebase/storage';
import { storage } from './config';

const MAX_AVATAR_BYTES = 2 * 1024 * 1024; // 2MB — espelha storage.rules

/** Faz upload da imagem do avatar para /avatars/{uid}/{fileName} e retorna a URL. */
export async function uploadAvatarImage(
  uid: string,
  file: File,
  fileName = 'avatar.png',
): Promise<string> {
  if (file.size >= MAX_AVATAR_BYTES) {
    throw new Error('Imagem muito grande (máx 2MB)');
  }
  if (!file.type.startsWith('image/')) {
    throw new Error('Arquivo precisa ser uma imagem');
  }

  const objectRef = ref(storage, `avatars/${uid}/${fileName}`);
  await uploadBytes(objectRef, file, { contentType: file.type });
  return getDownloadURL(objectRef);
}

export async function deleteAvatarImage(uid: string, fileName = 'avatar.png'): Promise<void> {
  await deleteObject(ref(storage, `avatars/${uid}/${fileName}`));
}

/** URL de leitura de um asset público do jogo. */
export function getGameAssetUrl(path: string): Promise<string> {
  return getDownloadURL(ref(storage, `game-assets/${path}`));
}
