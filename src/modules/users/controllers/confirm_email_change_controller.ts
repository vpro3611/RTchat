import {
    ConfirmEmailChangeUseCase
} from "../../infrasctructure/ports/email_verif_infra/email_verif_service/confirm_email_change_use_case";
import {Request, Response} from "express";

export class ConfirmEmailChangeController {
    constructor(private readonly confirmEmailChangeUseCase: ConfirmEmailChangeUseCase) {
        if (!process.env.FRONTEND_URL) {
            throw new Error("FRONTEND_URL is not defined");
        }
    }


    confirmEmailChangeCont = async (req: Request, res: Response) => {
        const token = req.query.token as string;

        if (!token) {
            return res.redirect(`${process.env.FRONTEND_URL}/email-verified?status=error`);
        }

        try {
            await this.confirmEmailChangeUseCase.execute(token);
            return res.redirect(`${process.env.FRONTEND_URL}/email-verified?status=success`);
        } catch (error) {
            return res.redirect(`${process.env.FRONTEND_URL}/email-verified?status=error`);
        }
    }

}