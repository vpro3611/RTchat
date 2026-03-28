import { Request, Response } from "express";
import { GetAvatarUseCase } from "../../application/avatar/get_avatar_use_case";

export class GetAvatarController {
    constructor(private readonly getAvatarUseCase: GetAvatarUseCase) {}

    execute = async (req: Request, res: Response) => {
        const { avatarId } = req.params;
        const avatar = await this.getAvatarUseCase.execute(avatarId as string);

        if (!avatar) {
            return res.status(404).send("Avatar not found");
        }

        res.setHeader("Content-Type", avatar.getMimeType());
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        return res.status(200).send(avatar.getData());
    }
}
