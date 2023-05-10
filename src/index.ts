import { IncomingMessage, ServerResponse } from "http";
import { HttpServer } from "./lib/classes/app";

const app = HttpServer.app();

app.listen(3000, "127.0.0.1", () => {
    console.log("Server is listening");
});

app.use((req: IncomingMessage, res: ServerResponse) => {
    console.log("Middleware called");
});

app.get("/ilia", (req: IncomingMessage, res: ServerResponse) => {
    res.end("zd");
});