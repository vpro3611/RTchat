export interface EncryptionPort {
    /**
     * Encrypts a string or buffer and returns a formatted string: iv:authTag:ciphertext (base64)
     */
    encrypt(data: string | Buffer): string;

    /**
     * Decrypts an encrypted string and returns the original string.
     */
    decrypt(encrypted: string): string;

    /**
     * Decrypts an encrypted string and returns the original buffer.
     */
    decryptBuffer(encrypted: string): Buffer;

    /**
     * Encrypts a buffer and returns a buffer containing [IV][AuthTag][Ciphertext]
     */
    encryptToBuffer(data: Buffer): Buffer;

    /**
     * Decrypts a buffer containing [IV][AuthTag][Ciphertext] and returns the original buffer.
     */
    decryptFromBuffer(data: Buffer): Buffer;
}
