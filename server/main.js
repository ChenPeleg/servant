//@ts-check

import http from 'http';
import { extname, join as joinPath } from 'path';
import { existsSync, readFileSync, statSync } from 'fs';
import { ApiController } from './controller/controller.js';

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
