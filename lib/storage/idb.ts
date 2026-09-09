// IndexedDB utilities for client-side storage
const DB_NAME = 'zyra-wallet-v1';
const DB_VERSION = 1;

const STORES = {
  ENCRYPTED_SEEDS: 'encryptedSeeds',
  AES_KEYS: 'aesKeys',
} as const;

/**
 * Open database connection
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains(STORES.ENCRYPTED_SEEDS)) {
        db.createObjectStore(STORES.ENCRYPTED_SEEDS);
      }
      if (!db.objectStoreNames.contains(STORES.AES_KEYS)) {
        db.createObjectStore(STORES.AES_KEYS);
      }
    };
  });
}

/**
 * Store data in IndexedDB
 */
export async function idbSet(storeName: string, key: string, value: unknown): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(value, key);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    transaction.onerror = () => reject(transaction.error);
  });
}

/**
 * Retrieve data from IndexedDB
 */
export async function idbGet<T = unknown>(storeName: string, key: string): Promise<T | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(key);

    request.onsuccess = () => resolve(request.result as T | undefined);
    request.onerror = () => reject(request.error);
    transaction.onerror = () => reject(transaction.error);
  });
}

/**
 * Delete data from IndexedDB
 */
export async function idbDelete(storeName: string, key: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(key);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    transaction.onerror = () => reject(transaction.error);
  });
}

/**
 * Check if data exists in IndexedDB
 */
export async function idbHas(storeName: string, key: string): Promise<boolean> {
  const data = await idbGet(storeName, key);
  return data !== undefined;
}

export { STORES };

