// Client-side crypto utilities for PIN/password-based encryption/decryption of secrets
// Uses PBKDF2 for key derivation and AES-256-CBC for encryption (compatible with backend)
import * as CryptoJS from 'crypto-js';

const ITERATIONS = 100000; // Number of PBKDF2 iterations
const KEY_SIZE = 256 / 32; // 256-bit key for AES, 32-bit words

/**
 * Encrypts a plaintext string using AES-256-CBC with a password-derived key.
 * @param plaintext The string to encrypt (e.g., mnemonic).
 * @param password The password/PIN for encryption.
 * @returns An object containing the ciphertext, IV, and salt, all as Base64 strings.
 */
export function encryptWithPassword(plaintext: string, password: string): { encryptedSecret: string; iv: string; salt: string } {
  const salt = CryptoJS.lib.WordArray.random(128 / 8); // 128-bit salt
  const iv = CryptoJS.lib.WordArray.random(128 / 8); // 128-bit IV

  const key = CryptoJS.PBKDF2(password, salt, {
    keySize: KEY_SIZE,
    iterations: ITERATIONS,
  });

  const encrypted = CryptoJS.AES.encrypt(plaintext, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return {
    encryptedSecret: encrypted.ciphertext.toString(CryptoJS.enc.Base64),
    iv: iv.toString(CryptoJS.enc.Base64),
    salt: salt.toString(CryptoJS.enc.Base64),
  };
}

/**
 * Decrypts a ciphertext using AES-256-CBC with a password-derived key.
 * @param encryptedSecretBase64 The Base64 encoded ciphertext.
 * @param ivBase64 The Base64 encoded IV.
 * @param saltBase64 The Base64 encoded salt.
 * @param password The password/PIN for decryption.
 * @returns The decrypted plaintext string.
 * @throws {Error} If decryption fails (e.g., wrong password).
 */
export function decryptWithPassword(encryptedSecretBase64: string, password: string, saltBase64: string, ivBase64: string): string {
  const salt = CryptoJS.enc.Base64.parse(saltBase64);
  const iv = CryptoJS.enc.Base64.parse(ivBase64);
  const ciphertext = CryptoJS.enc.Base64.parse(encryptedSecretBase64);

  const key = CryptoJS.PBKDF2(password, salt, {
    keySize: KEY_SIZE,
    iterations: ITERATIONS,
  });

  const decrypted = CryptoJS.AES.decrypt(
    { ciphertext: ciphertext } as CryptoJS.lib.CipherParams, // Cast to CipherParams
    key,
    {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }
  );

  try {
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (e) {
    throw new Error('Decryption failed. Incorrect password or corrupted data.');
  }
}
