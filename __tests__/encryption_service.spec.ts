import {CryptoEncryptionService} from "../src/modules/infrasctructure/crypto_encryption_service";
import * as crypto from "crypto";

describe('CryptoEncryptionService', () => {
    let encryptionService: CryptoEncryptionService;
    const testKey = crypto.randomBytes(32).toString('hex');

    beforeEach(() => {
        encryptionService = new CryptoEncryptionService(testKey);
    });

    it('should encrypt and decrypt a string', () => {
        const plainText = "Hello, world!";
        const encrypted = encryptionService.encrypt(plainText);
        
        expect(encrypted).toContain(':');
        const parts = encrypted.split(':');
        expect(parts).toHaveLength(3);
        
        const decrypted = encryptionService.decrypt(encrypted);
        expect(decrypted).toBe(plainText);
    });

    it('should encrypt and decrypt a buffer', () => {
        const data = Buffer.from([1, 2, 3, 4, 5]);
        const encrypted = encryptionService.encrypt(data);
        
        const decrypted = encryptionService.decryptBuffer(encrypted);
        expect(decrypted).toEqual(data);
    });

    it('should produce different ciphertexts for same plain text (due to unique IV)', () => {
        const plainText = "Secret message";
        const encrypted1 = encryptionService.encrypt(plainText);
        const encrypted2 = encryptionService.encrypt(plainText);
        
        expect(encrypted1).not.toBe(encrypted2);
        
        expect(encryptionService.decrypt(encrypted1)).toBe(plainText);
        expect(encryptionService.decrypt(encrypted2)).toBe(plainText);
    });

    it('should encrypt and decrypt to/from buffer', () => {
        const data = Buffer.from("Sensitive binary data");
        const encrypted = encryptionService.encryptToBuffer(data);
        
        expect(encrypted.length).toBeGreaterThan(data.length);
        
        const decrypted = encryptionService.decryptFromBuffer(encrypted);
        expect(decrypted.toString()).toBe(data.toString());
    });

    it('should throw error for invalid key length', () => {
        expect(() => new CryptoEncryptionService("short-key")).toThrow('Encryption key must be a 32-byte hex string');
    });

    it('should throw error for invalid encrypted format', () => {
        expect(() => encryptionService.decrypt("invalid-format")).toThrow('Invalid encrypted data format');
    });

    it('should throw error if decryption fails (e.g. wrong key)', () => {
        const encrypted = encryptionService.encrypt("Top secret");
        const otherService = new CryptoEncryptionService(crypto.randomBytes(32).toString('hex'));
        
        expect(() => otherService.decrypt(encrypted)).toThrow();
    });
});
