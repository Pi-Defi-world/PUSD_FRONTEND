// Client-side crypto utilities using WebCrypto API

/**
 * Generate a random 256-bit AES-GCM key
 */
export async function generateAesKey(): Promise<CryptoKey> {
  return window.crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true, // extractable so we can export it
    ['encrypt', 'decrypt', 'wrapKey', 'unwrapKey']
  );
}

/**
 * Encrypt plaintext using AES-GCM
 */
export async function aesEncrypt(
  key: CryptoKey,
  plaintext: string
): Promise<{ ciphertext: Uint8Array; iv: Uint8Array }> {
  const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 12 bytes for AES-GCM
  const encoder = new TextEncoder();
  const plaintextBytes = encoder.encode(plaintext);

  const ciphertext = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv as BufferSource,
    },
    key,
    plaintextBytes
  );

  return {
    ciphertext: new Uint8Array(ciphertext),
    iv: iv,
  };
}

/**
 * Decrypt ciphertext using AES-GCM
 */
export async function aesDecrypt(
  key: CryptoKey,
  ciphertext: Uint8Array,
  iv: Uint8Array
): Promise<string> {
  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv as BufferSource,
    },
    key,
    ciphertext as BufferSource
  );

  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

/**
 * Export CryptoKey as raw bytes (Uint8Array)
 */
export async function exportCryptoKey(key: CryptoKey): Promise<Uint8Array> {
  const exported = await window.crypto.subtle.exportKey('raw', key);
  return new Uint8Array(exported);
}

/**
 * Import raw bytes back to CryptoKey
 */
export async function importRawAesKey(raw: ArrayBuffer | Uint8Array): Promise<CryptoKey> {
  const rawBuffer = raw instanceof Uint8Array ? raw.buffer : raw;
  
  return window.crypto.subtle.importKey(
    'raw',
    rawBuffer as ArrayBuffer,
    'AES-GCM',
    true, // extractable
    ['encrypt', 'decrypt', 'wrapKey', 'unwrapKey']
  );
}

