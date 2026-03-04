import {AppContainer} from "./container";
import express, {Express} from "express";
import cookieParser from "cookie-parser";


export function createApp(dependencies: AppContainer): Express
{
    const app = express();

    // TODO : loger middleware here.

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());

    const publicRouter = express.Router();
    const privateRouter = express.Router();

    app.use("/public", publicRouter);
    app.use("/private", privateRouter);

    // TODO : ROUTES
    // TODO : MIDDLEWARES
    return app;
}