import {BcryptInterface} from "./bcrypt_interface";
import * as bcrypt from "bcrypt";

export class Bcrypter implements BcryptInterface {
    constructor(private readonly saltRounds: number = 12) {
    }
    async hash(plain: string): Promise<string> {
        return await bcrypt.hash(plain, this.saltRounds);
    }

    async compare(plain: string, hash: string): Promise<boolean> {
        return await bcrypt.compare(plain, hash);
    }
}