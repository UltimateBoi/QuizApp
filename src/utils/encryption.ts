/**
 * Encryption utilities for sensitive data like API keys
 * 
 * This module provides client-side encryption/decryption for API keys before syncing
 * to Firebase. The encryption key is derived from the user's Firebase UID, which means:
 * - API keys are encrypted differently for each user
 * - API keys can be decrypted only by the same user
 * - API keys stored in Firebase are not readable in plaintext
 * 
 * Additionally, a SHA-256 hash of the API key is stored in Firestore for verification
 * purposes. This one-way hash provides an additional security layer, ensuring that even
 * if the database is compromised, the original API keys cannot be recovered from the hash alone.
 */

/**
 * Derives an encryption key from a user ID using PBKDF2
 */
async function deriveKey(userId: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(userId),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  // Use a static salt (in production, consider storing this securely)
  const salt = enc.encode('quiz-app-gemini-key-salt-v1');

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts a string value using AES-GCM
 * Returns base64-encoded encrypted data with IV prepended
 */
export async function encryptApiKey(apiKey: string, userId: string): Promise<string> {
  if (!apiKey) return '';
  
  try {
    const key = await deriveKey(userId);
    const enc = new TextEncoder();
    const data = enc.encode(apiKey);
    
    // Generate a random IV
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // Encrypt the data
    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      data
    );
    
    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encrypted), iv.length);
    
    // Convert to base64
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt API key');
  }
}

/**
 * Decrypts a base64-encoded encrypted string
 * Returns the original plaintext value
 */
export async function decryptApiKey(encryptedData: string, userId: string): Promise<string> {
  if (!encryptedData) return '';
  
  try {
    const key = await deriveKey(userId);
    
    // Convert from base64
    const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    
    // Extract IV and encrypted data
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);
    
    // Decrypt the data
    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      encrypted
    );
    
    // Convert back to string
    const dec = new TextDecoder();
    return dec.decode(decrypted);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt API key');
  }
}

/**
 * Creates a one-way hash of the API key for verification purposes
 * This can be used to check if the API key has changed without storing it in plaintext
 */
export async function hashApiKey(apiKey: string): Promise<string> {
  if (!apiKey) return '';
  
  const enc = new TextEncoder();
  const data = enc.encode(apiKey);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
