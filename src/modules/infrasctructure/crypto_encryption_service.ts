import * as crypto from 'crypto';
import {EncryptionPort} from "./ports/encryption/encryption_port";

export class CryptoEncryptionService implements EncryptionPort {
    private readonly algorithm = 'aes-256-gcm';
    private readonly ivLength = 12;
    private readonly authTagLength = 16;
    private readonly key: Buffer;

    constructor(encryptionKey?: string) {
        const keyString = encryptionKey || process.env.MESSAGE_ENCRYPTION_KEY;
        if (!keyString) {
            throw new Error('Encryption key not provided. Set MESSAGE_ENCRYPTION_KEY env variable.');
        }

        // Key should be 32 bytes for aes-256
        this.key = Buffer.from(keyString, 'hex');
        if (this.key.length !== 32) {
            throw new Error('Encryption key must be a 32-byte hex string (64 characters).');
        }
    }

    encrypt(data: string | Buffer): string {
        const iv = crypto.randomBytes(this.ivLength);
        const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
        
        let ciphertext = cipher.update(typeof data === 'string' ? Buffer.from(data) : data);
        ciphertext = Buffer.concat([ciphertext, cipher.final()]);
        
        const authTag = cipher.getAuthTag();
        
        // Return format: iv:authTag:ciphertext (all in base64)
        return `${iv.toString('base64')}:${authTag.toString('base64')}:${ciphertext.toString('base64')}`;
    }

    decrypt(encrypted: string): string {
        return this.decryptBuffer(encrypted).toString('utf8');
    }

    decryptBuffer(encrypted: string): Buffer {
        const parts = encrypted.split(':');
        if (parts.length !== 3) {
            throw new Error('Invalid encrypted data format.');
        }

        const iv = Buffer.from(parts[0], 'base64');
        const authTag = Buffer.from(parts[1], 'base64');
        const ciphertext = Buffer.from(parts[2], 'base64');

        const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
        decipher.setAuthTag(authTag);
        
        let decrypted = decipher.update(ciphertext);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        
        return decrypted;
    }

    encryptToBuffer(data: Buffer): Buffer {
        const iv = crypto.randomBytes(this.ivLength);
        const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
        
        let ciphertext = cipher.update(data);
        ciphertext = Buffer.concat([ciphertext, cipher.final()]);
        
        const authTag = cipher.getAuthTag();
        
        // Return format: [iv][authTag][ciphertext]
        return Buffer.concat([iv, authTag, ciphertext]);
    }

    decryptFromBuffer(data: Buffer): Buffer {
        if (data.length < this.ivLength + this.authTagLength) {
            throw new Error('Data too short to be encrypted.');
        }

        const iv = data.subarray(0, this.ivLength);
        const authTag = data.subarray(this.ivLength, this.ivLength + this.authTagLength);
        const ciphertext = data.subarray(this.ivLength + this.authTagLength);

        const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
        decipher.setAuthTag(authTag);
        
        let decrypted = decipher.update(ciphertext);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        
        return decrypted;
    }
}
