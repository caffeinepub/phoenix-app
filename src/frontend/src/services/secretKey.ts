// Secret Pocket Key service — persists a 4-char alphanumeric key per user

const STORAGE_PREFIX = "phonex_secret_key_";

function storageKey(userId: string): string {
  return `${STORAGE_PREFIX}${userId}`;
}

/** Validates that the input is exactly 4 alphanumeric characters */
export function isValidFormat(key: string): boolean {
  return /^[A-Z0-9]{4}$/.test(key.toUpperCase());
}

/** Saves the 4-char alphanumeric secret key for a user */
export function setSecretKey(userId: string, key: string): void {
  const normalized = key
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 4);
  localStorage.setItem(storageKey(userId), normalized);
}

/** Retrieves the stored secret key for a user, or null if not set */
export function getSecretKey(userId: string): string | null {
  return localStorage.getItem(storageKey(userId));
}

/** Returns true if the user has already set a secret key */
export function hasSecretKey(userId: string): boolean {
  return localStorage.getItem(storageKey(userId)) !== null;
}

/** Returns true if the input matches the stored secret key */
export function validateSecretKey(userId: string, input: string): boolean {
  const stored = getSecretKey(userId);
  if (!stored) return false;
  return (
    stored ===
    input
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 4)
  );
}
