import { IncomingMessage, ServerResponse } from "http";

export type Middleware = (req: IncomingMessage, res: ServerResponse, next?: () => void) => void;

export interface IHttpServer {
    listen(port: number, host: string, callback?: () => void): void;
    use(middleware: Middleware): void;
    get(route: string, callback: (req: IncomingMessage, res: ServerResponse) => void): void;
    post(route: string, callback: (req: IncomingMessage, res: ServerResponse) => void): void;
    put(route: string, callback: (req: IncomingMessage, res: ServerResponse) => void): void;
    delete(route: string, callback: (req: IncomingMessage, res: ServerResponse) => void): void;
}