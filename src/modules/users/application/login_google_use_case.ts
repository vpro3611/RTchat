import {UserRepoReader} from "../ports/user_repo_interfaces";
import {UserMapper} from "../shared/map_to_dto";
import {GoogleAuthServiceInterface} from "../../authentification/ports/google_auth_service_interface";
import {TokenServiceInterface} from "../../authentification/ports/token_service_interface";
import {UserDTO} from "../DTO/user_dto";

export class LoginGoogleUseCase {
    constructor(private readonly userRepoReader: UserRepoReader,
                private readonly mapper: UserMapper,
                private readonly googleAuthService: GoogleAuthServiceInterface,
                private readonly tokenService: TokenServiceInterface
    ) {}

    async loginGoogleUseCase(idToken: string): Promise<{user: UserDTO | null, registrationToken: string | null}> {
        const email = await this.googleAuthService.verifyIdToken(idToken);
        
        const user = await this.userRepoReader.getUserByEmail(email);

        if (!user) {
            const registrationToken = this.tokenService.generateRegistrationToken(email);
            return { user: null, registrationToken };
        }

        user.canLogin();
        
        return { user: this.mapper.mapToDto(user), registrationToken: null };
    }
}
