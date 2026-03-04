import {assembleContainer} from "./container";
import {createApp} from "./app";


export async function startServer() {
    const dependencies = assembleContainer();
    const app = createApp(dependencies);

    const port = process.env.PORT || 3000;

    app.listen(port, () => {
        console.log(`Server is running on port ${port}! Happy developing!`);
    });
}