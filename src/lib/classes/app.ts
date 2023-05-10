import { IncomingMessage, Server, ServerResponse, createServer } from "http";
import { IHttpServer, Middleware } from "../interfaces/app";

/**
 * HttpServer class implementing IHttpServer interface
 */
export class HttpServer implements IHttpServer {

    private readonly server: Server;
    private readonly middlewares: Middleware[];

    private static instance: HttpServer | null;

    /**
     * Constructor for HttpServer class
     */
    private constructor() {
        this.server = createServer(this.handleRequest.bind(this));
        this.middlewares = [];
    }

    /* Singleton Pattern */
    public static app(): HttpServer {
        if(HttpServer.instance) {
            throw new Error("You can not run 2 servers on the same machine");
        }

        HttpServer.instance = new HttpServer();
        return HttpServer.instance;
    }

    /**
     * Request handler method for server
     * @param req - IncomingMessage object representing the request
     * @param res - ServerResponse object representing the response
     */
    private handleRequest(req: IncomingMessage, res: ServerResponse): void {
        
        /* Handle middlewares by iterating through this.middlewares */
        let currentMiddlewareIndex = 0;

        const nextMiddleware = (): void => {
            currentMiddlewareIndex++;
            if (currentMiddlewareIndex < this.middlewares.length) {
                this.middlewares[currentMiddlewareIndex](req, res, nextMiddleware);
            } else {
                /* If there are no middlewares left, run the controller */
                this.finalRequestHandler(req, res);
            }
        };

        /* Begin from the first middleware and run all of them */
        this.middlewares[0](req, res, nextMiddleware);
    }

    /**
     * Handles the final request by writing a response indicating the method and URL of the request. 
     * @param req - The incoming HTTP request object.
     * @param res - The HTTP response object to send the response to.
    */
    private finalRequestHandler(req: IncomingMessage, res: ServerResponse) {
        const { method, url } = req;
        const headers = { "Content-Type": "text/plain" };
        
        switch (method) {
            case "GET":
            case "POST":
            case "PUT":
            case "DELETE":
                res.writeHead(200, headers);
                res.end(`Received ${method} request for ${url}`);
                break;
            default:
                res.writeHead(405, headers);
                res.end(`Method ${method} not allowed`);
                break;
        }
    }


    /**
     * Register a new handler for a specific HTTP method and route.
     *
     * @param {string} method - The HTTP method (GET, POST, PUT, DELETE) for this handler.
     * @param {string} route - The route that this handler will be registered for.
     * @param {function} callback - The function that will handle the incoming request.
    */
    private registerHandler(method: string, route: string, callback: (req: IncomingMessage, res: ServerResponse<IncomingMessage>) => void): void {
        this.server.on("request", (req: IncomingMessage, res: ServerResponse<IncomingMessage>) => {
            if (req.method !== method) {
                res.writeHead(405, { "Content-Type": "text/plain" });
                res.end(`Method ${method} not allowed`);
                return;
            }
            if (req.url !== route) {
                res.writeHead(404, { "Content-Type": "text/plain" });
                res.end("Not found");
                return;
            }

            callback(req, res);
        });
    }

    /**
         * @param {number} port
         * @param {string} host
         * @param {(() => void) | undefined} port
         * @returns {void}
         * @description Establishes server to the certain port and host
    */
    public listen(port: number, host: string, callback?: (() => void) | undefined): void {
        this.server.listen(port, host, callback);
    }

    /**
     * Registers a middleware function for the specified route
     * @param route - URL path to register the middleware for
     * @param middleware - Middleware function to execute
     */
    public use(middleware: Middleware): void {
        this.middlewares.push(middleware);
    }

    /**
         * @param {string} route - Endpoint url
         * @param {(req: IncomingMessage, res: ServerResponse<IncomingMessage>) => void} callback
         * @returns {void}
    */
    public get(route: string, callback: (req: IncomingMessage, res: ServerResponse<IncomingMessage>) => void): void {
        this.registerHandler("GET", route, callback);
    }

    /**
         * @param {string} route - Endpoint url
         * @param {(req: IncomingMessage, res: ServerResponse<IncomingMessage>) => void} callback
         * @returns {void}
    */
    public post(route: string, callback: (req: IncomingMessage, res: ServerResponse<IncomingMessage>) => void): void {
        this.registerHandler("POST", route, callback);
    }

    /**
         * @param {string} route - Endpoint url
         * @param {(req: IncomingMessage, res: ServerResponse<IncomingMessage>) => void} callback
         * @returns {void}
    */
    public put(route: string, callback: (req: IncomingMessage, res: ServerResponse<IncomingMessage>) => void): void {
        this.registerHandler("PUT", route, callback);
    }

    /**
         * @param {string} route - Endpoint url
         * @param {(req: IncomingMessage, res: ServerResponse<IncomingMessage>) => void} callback
         * @returns {void}
    */
    public delete(route: string, callback: (req: IncomingMessage, res: ServerResponse<IncomingMessage>) => void): void {
        this.registerHandler("DELETE", route, callback);
    }

}
