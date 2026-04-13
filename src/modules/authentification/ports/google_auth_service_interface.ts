export interface GoogleAuthServiceInterface {
    verifyIdToken(idToken: string): Promise<string>;
}