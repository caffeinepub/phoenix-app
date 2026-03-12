// E2E Encryption Service using Web Crypto API (AES-GCM 256-bit)
// Falls back to XOR+base64 if Web Crypto is unavailable

const CRYPTO_AVAILABLE =
  typeof window !== "undefined" &&
  typeof window.crypto !== "undefined" &&
  typeof window.crypto.subtle !== "undefined";

// ── Key derivation ────────────────────────────────────────────────────────────

/** Derives a stable 32-char key string from a seed (userId/password) */
export function generateEncryptionKey(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  }
  const base = Math.abs(hash).toString(16).padStart(8, "0");
  return (base.repeat(4) + seed.slice(0, 32)).slice(0, 32);
}

async function deriveKey(seed: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    encoder.encode(seed),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: encoder.encode("phonex-salt-v1"),
      iterations: 10000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

async function encryptWithCrypto(text: string, seed: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await deriveKey(seed);
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(text),
  );
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encrypted), iv.length);
  return btoa(String.fromCharCode(...combined));
}

async function decryptWithCrypto(
  ciphertext: string,
  seed: string,
): Promise<string> {
  const combined = new Uint8Array(
    atob(ciphertext)
      .split("")
      .map((c) => c.charCodeAt(0)),
  );
  const iv = combined.slice(0, 12);
  const data = combined.slice(12);
  const key = await deriveKey(seed);
  const decrypted = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    data,
  );
  return new TextDecoder().decode(decrypted);
}

function xorEncrypt(text: string, key: string): string {
  const keyBytes = Array.from(key).map((c) => c.charCodeAt(0));
  const result = Array.from(text).map((c, i) =>
    String.fromCharCode(c.charCodeAt(0) ^ keyBytes[i % keyBytes.length]),
  );
  return btoa(result.join(""));
}

function xorDecrypt(ciphertext: string, key: string): string {
  const decoded = atob(ciphertext);
  const keyBytes = Array.from(key).map((c) => c.charCodeAt(0));
  return Array.from(decoded)
    .map((c, i) =>
      String.fromCharCode(c.charCodeAt(0) ^ keyBytes[i % keyBytes.length]),
    )
    .join("");
}

/** Encrypts text using the user's seed as key. Returns base64 string. */
export async function encryptText(
  text: string,
  keySeed: string,
): Promise<string> {
  try {
    if (CRYPTO_AVAILABLE) {
      return await encryptWithCrypto(text, keySeed);
    }
  } catch {
    // fall through to XOR
  }
  const derivedKey = generateEncryptionKey(keySeed);
  return xorEncrypt(text, derivedKey);
}

/** Decrypts a base64 ciphertext using the user's seed as key. */
export async function decryptText(
  ciphertext: string,
  keySeed: string,
): Promise<string> {
  try {
    if (CRYPTO_AVAILABLE) {
      return await decryptWithCrypto(ciphertext, keySeed);
    }
  } catch {
    // fall through to XOR
  }
  const derivedKey = generateEncryptionKey(keySeed);
  return xorDecrypt(ciphertext, derivedKey);
}
