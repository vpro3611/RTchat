import {
    ResendVerificationService
} from "../../infrasctructure/ports/email_verif_infra/email_sender/resend_verification_service";
import {ExtractUserIdFromReq} from "../shared/extract_user_id_from_req";
import {Request, Response} from "express";

export class ResendChangeEmailVerificationController {
    constructor(private readonly resendVerificationService: ResendVerificationService,
                private readonly extractUserIdFromReq: ExtractUserIdFromReq
    ) {}

    resendChangeEmailVerificationCont = async (req: Request, res: Response) => {
        const userId = this.extractUserIdFromReq.extractUserId(req);

        await this.resendVerificationService.resendChangeEmail(userId);

        return res.status(200).json({ok: true});
    }
}