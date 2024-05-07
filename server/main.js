//@ts-check

import http from 'http';

import { resolve } from 'node:path';
import { extname, join as joinPath } from 'path';
import { existsSync, readFileSync, statSync } from 'fs';

const port = process.argv[2] || 4200;

const index = 'html/index.html';


class MainServer {
    start() {
        const server =
            http.createServer(this.serverMainHandler.bind(this) );
        server.listen(parseInt(port, 10));
    }

    serverMainHandler(request, response) {

        // const uri = ( new URL(request.url)).pathname;
        const basePath = resolve(process.cwd(), '../html/index.html');

        let filename = joinPath(basePath, '');
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


}

const server = new MainServer();
server.start();
console.log('\x1b[36m Server running at http://localhost:' + port + '\x1b[0m');
