
import * as crypto from 'crypto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EncryptionService {
    private encryptionKey: string;
    private iv: Buffer;

    constructor() {
        this.encryptionKey = process.env.ENCRYPTION_KEY
        this.iv = crypto.randomBytes(16);

    }

    encryptData(data: string, key: string): string {
        const cipher = crypto.createCipheriv('aes-256-cbc', key, this.iv);
        let encryptedData = cipher.update(data, 'utf8', 'hex');
        encryptedData += cipher.final('hex');
        return encryptedData;
    }

    // decryptData(encryptedData: string, key: string): string {
    //     const decipher = crypto.createDecipheriv('aes-256-cbc', key, this.iv);
    //     let decryptedData = decipher.update(encryptedData, 'hex', 'utf8');
    //     decryptedData += decipher.final('utf8');
    //     return decryptedData;
    // }


}

