//@ts-check

import http from 'http';
import { extname, join as joinPath } from 'path';
import { existsSync, readFileSync, statSync } from 'fs';

const port = process.argv[2] || 4200;

const index = 'html/index.html';


class MainServer {
    constructor({ root, port } = {}) {
        this.root = root || process.cwd();
        this.port = port;
    }

    start() {
        const server = http.createServer(this.serverMainHandler.bind(this));
        server.listen(parseInt(port, 10));
    }

    staticFileServer(request, response ) {
        const basePath = this.root;
        let filename = joinPath(basePath, request.url);
        const contentTypesByExtension = {
            '.html': 'text/html',
            '.css': 'text/css',
            '.js': 'text/javascript',
            '.json': 'text/json',
            '.svg': 'image/svg+xml',
        };
        if (!existsSync(filename)) {
            console.log('FAIL: ' + filename);
            filename = joinPath(process.cwd(), '/404.html');
        } else if (statSync(filename).isDirectory()) {
            console.log('FLDR: ' + filename);
            filename += '/index.html';
        }

        try {
            const file = readFileSync(filename, 'binary');
            console.log('FILE: ' + filename);
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

    serverMainHandler(request, response) {
        this.staticFileServer(request, response);


    }


}

class ServerConfig {
    constructor() {
        this.port = 4200;
        this.root = process.cwd();
    }
}

const server = new MainServer();
server.start();
console.log('\x1b[36m Server running at http://localhost:' + port + '\x1b[0m');
