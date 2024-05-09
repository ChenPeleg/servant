//@ts-check

import http from 'http';
import { extname, join as joinPath } from 'path';
import { existsSync, readFileSync, statSync } from 'fs';
import { writeFile, readFile } from 'node:fs/promises';

class MainServer {
    constructor({ root, port, staticFolder, apiController } = {}) {
        this.staticFolder = staticFolder || 'public';
        this.root = root || process.cwd();
        this.port = port || 4200;
        this.apiConteoller = apiController;
    }

    start() {
        const server = http.createServer(this.serverMainHandler.bind(this));
        server.listen(parseInt(this.port, 10));
        console.log(
            '\x1b[36m Server running at http://localhost:' +
                this.port +
                '\x1b[0m'
        );
    }

    staticFileServer(request, response) {
        const basePath = joinPath(this.root, this.staticFolder);
        let filename = joinPath(basePath, request.url);
        const contentTypesByExtension = {
            '.html': 'text/html',
            '.css': 'text/css',
            '.js': 'text/javascript',
            '.json': 'text/json',
            '.svg': 'image/svg+xml',
        };
        if (!existsSync(filename)) {
            if (filename.includes('api')) {
                response.writeHead(400, { 'Content-Type': 'text/plain' });
                response.write('API call not found');
                response.end();
                return;
            }
            filename = joinPath(process.cwd(), '/404.html');
        } else if (statSync(filename).isDirectory()) {
            filename += '/index.html';
        }

        try {
            const file = readFileSync(filename, 'binary');

            const headers = {};
            const contentType = contentTypesByExtension[extname(filename)];
            if (contentType) {
                headers['Content-Type'] = contentType;
            }
            response.writeHead(200, headers);
            response.write(file, 'binary');
            response.end();
        } catch (err) {
            console.error(err);
            response.writeHead(500, { 'Content-Type': 'text/plain' });
            response.write(err + '\n');
            response.end();
        }
    }

    apiCallsServer(request, response) {
        if (!this.apiConteoller) {
            return;
        }
        return this.apiConteoller.use(request, response);
    }

    async serverMainHandler(request, response) {
        const result = await this.apiCallsServer(request, response);
        if (result && result.handled) {
            return;
        }
        this.staticFileServer(request, response);
    }
}

export class ApiController {
    static stateSaveFileName = './server.state.temp';

    constructor({ initialState, persistState } = {}) {
        this.persistState = persistState || false;
        this.routes = [];
        this.state = initialState || {};
        if (this.persistState) {
            this.tryToLoadState().then();
        }
    }

    static isRouteMatch(path, request) {
        const pathParts = path.split('/');
        const requestParts = request.url.split('/');
        if (pathParts.length !== requestParts.length) {
            return false;
        }
        return pathParts.every((part, i) => {
            if (part.startsWith(':')) {
                return true;
            }
            return part === requestParts[i];
        });
    }

    static getVariablesFromPath(path, request) {
        const requestWithoutQuery = request.url.split('?')[0];
        const pathParts = path.split('/');
        const requestParts = requestWithoutQuery.split('/');
        const variables = {};
        pathParts.forEach((part, i) => {
            if (part.startsWith(':')) {
                variables[part.substring(1)] = requestParts[i];
            }
        });
        return variables;
    }

    async tryToLoadState() {
        try {
            const state = await readFile(
                ApiController.stateSaveFileName,
                'utf8'
            );
            this.state = JSON.parse(state);
        } catch (err) {
            console.log('state not loaded', err);
        }
    }

    use(request, response) {
        const route = this.routes.find((r) =>
            ApiController.isRouteMatch(r.route, request)
        );
        if (!route) {
            return { handled: false };
        }

        route.routeAction(request, response);
        if (this.persistState) {
            writeFile(
                ApiController.stateSaveFileName,
                JSON.stringify(this.state, null, 2),
                'utf8'
            ).then();
        }
        return { handled: true };
    }

    addRoute({ route, routeAction }) {
        this.routes.push({ route, routeAction });
        return this;
    }
}

const controller = new ApiController({
    initialState: { count: 0 },
    persistState: true,
});

controller
    .addRoute({
        route: '/api/first',
        routeAction: (req, res) => {
            controller.state.count = controller.state.count + 1;
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.write(
                `route ${req.url}  was called ${controller.state.count} times`
            );
            res.end();
        },
    })
    .addRoute({
        route: '/api/second/:id',
        routeAction: (req, res) => {
            const { id } = ApiController.getVariablesFromPath(
                '/api/second/:id',
                req
            );
            const params = new URLSearchParams(req.url.split('?')[1]);
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.write(
                `route ${req.url}  was called with id ${id} and params ${[...params.entries()]}`
            );
            res.end();
        },
    });

const server = new MainServer({
    port: 4200,
    staticFolder: 'public',
    apiController: controller,
});
server.start();