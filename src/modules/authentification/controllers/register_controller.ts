import {AuthService} from "../auth_service";
import {Request, Response} from "express";
import {z} from "zod";

export const RegisterBodySchema = z.object({
    username: z.string(),
    email: z.string().email(),
    password: z.string(),
})

type RegisterBody = z.infer<typeof RegisterBodySchema>;

export class RegisterController {
    constructor(private readonly authService: AuthService) {}

    registerController = async (req: Request<{}, {}, RegisterBody>, res: Response) => {
        const {username, email, password} = req.body;

        const result = await this.authService.register(username, email, password);

        return res.status(201).json({
            message: "User created successfully. Please verify your email.",
            user: result.user,
        });
    }
}