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
            // console.log('FAIL: ' + filename);
            filename = joinPath(process.cwd(), '/404.html');
        } else if (statSync(filename).isDirectory()) {
            // console.log('FLDR: ' + filename);
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

const controller = new ApiController();
controller.addRoute({
    route: '/api/first',
    routeAction: (req, res) => {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.write('First API call');
        res.end();
    },
});

const server = new MainServer({ port: 4200, staticFolder: 'public' });
server.start();
