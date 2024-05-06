import { spawn } from 'child_process';
import { watch } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

let server;

let lastFileChanged = '';

function startServer() {
    const __dirname = dirname(fileURLToPath(import.meta.url));
    server = spawn('node', [resolve(__dirname, 'main.js')]);
    // server.stdout.on('data', (data) => console.log(`stdout: ${data}`));
    // server.stderr.on('data', (data) => console.error(`stderr: ${data}`));
    // server.on('close', (code) => console.log(`child process exited with code ${code}`));
}

function restartServer() {
    console.log(`File ${lastFileChanged} was changed, restarting server...`);
    server.kill();
    startServer();
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        if (timeout) clearTimeout(timeout);
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

const debouncedRestart = debounce(restartServer, 2000);


watch('.', { recursive: true }, (eventType, filename) => {
    lastFileChanged = filename;
    debouncedRestart();
});

startServer();
