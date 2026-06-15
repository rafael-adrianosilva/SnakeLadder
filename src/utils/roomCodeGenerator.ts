/** Gerador de código de sala (Apêndice B do prompt mestre). */

// Sem caracteres ambíguos (0/O, 1/I)
const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateRoomCode(length = 6): string {
  let code = '';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  for (let i = 0; i < length; i++) {
    code += CHARS[array[i] % CHARS.length];
  }
  return code;
}
