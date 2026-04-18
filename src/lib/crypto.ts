/**
 * Client-side end-to-end encryption helpers using the Web Crypto API.
 * AES-GCM 256. Keys never leave the browser unencrypted in plaintext form
 * beyond their base64 export stored in the group record.
 */

const ALG = { name: "AES-GCM", length: 256 } as const;

// ---------- base64 helpers ----------
export function bufToB64(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let bin = "";
  for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

export function b64ToBuf(b64: string): ArrayBuffer {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
}

// ---------- key management ----------
export async function generateGroupKey(): Promise<CryptoKey> {
  return await window.crypto.subtle.generateKey(ALG, true, ["encrypt", "decrypt"]);
}

export async function exportKeyB64(key: CryptoKey): Promise<string> {
  const raw = await window.crypto.subtle.exportKey("raw", key);
  return bufToB64(raw);
}

export async function importKeyB64(b64: string): Promise<CryptoKey> {
  const raw = b64ToBuf(b64);
  return await window.crypto.subtle.importKey("raw", raw, ALG, true, ["encrypt", "decrypt"]);
}

// ---------- message encryption ----------
export interface EncryptedPayload {
  ciphertext: string; // base64
  iv: string; // base64 (12 bytes)
}

export async function encryptMessage(key: CryptoKey, plaintext: string): Promise<EncryptedPayload> {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const data = new TextEncoder().encode(plaintext);
  const ct = await window.crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data);
  return { ciphertext: bufToB64(ct), iv: bufToB64(iv) };
}

export async function decryptMessage(key: CryptoKey, ciphertextB64: string, ivB64: string): Promise<string> {
  const iv = b64ToBuf(ivB64);
  const ct = b64ToBuf(ciphertextB64);
  const pt = await window.crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
  return new TextDecoder().decode(pt);
}
