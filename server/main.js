//@ts-check

import http from 'http';
import {resolve} from "node:path";
import { join as joinPath, extname } from 'path';
import { existsSync, readFileSync, statSync } from 'fs';

const port = process.argv[2] || 4200;

const index = 'html/index.html';



http.createServer(function (request, response) {
   // const uri = ( new URL(request.url)).pathname;
    const basePath = resolve(process.cwd(), "../html/index.html");

    // fasdfasdfsadfasdf fsdf fdfsdfs fasdf


    let filename = joinPath(basePath, '');
    const contentTypesByExtension = {
        '.html': 'text/html',
        '.css':  'text/css',
        '.js':   'text/javascript',
        '.json': 'text/json',
        '.svg':  'image/svg+xml'
    };
    if (!existsSync(filename)) {
        console.log( 'FAIL: ' + filename);
        filename = joinPath(process.cwd(), '/404.html');
    } else if (statSync(filename).isDirectory()) {
        console.log( 'FLDR: ' + filename);
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
        response.writeHead(500, {'Content-Type': 'text/plain'});
        response.write(err + '\n');
        response.end();
    }

}).listen(parseInt(port, 10));
console.log( 'Static file server running at\n  => http://localhost:' + port + '/\nCTRL' +
    ' + C to shutdown');