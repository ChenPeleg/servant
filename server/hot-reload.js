import { spawn } from 'child_process';
import { existsSync, readFileSync, watch } from 'node:fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { lstat } from 'fs/promises';


class HotReload {
    debouncedRestart = this.debounce(this.restartServer.bind(this), 2000);

    constructor(serverFilePath = 'main.js') {
        this.rootPath = resolve(process.cwd());
        this.ignoredPatterns = this.getIgnoredPatterns(this.rootPath);
        this.serverFilePath = serverFilePath;
        this.server = null;
        this.lastFileChanged = '';
        this.timeout = null;
    }

    run() {
        console.log(`\x1b[33m 🚀 Hot reload watching files in "${this.rootPath}" \x1b[0m`);
        this.startServer();
        this.watchFiles();
    }

    startServer() {
        const __dirname = dirname(fileURLToPath(import.meta.url));
        this.server = spawn('node', [resolve(__dirname, this.serverFilePath)]);
        this.server.stdout.on('data', (data) => console.log(data.toString()));
        this.server.stderr.on('data', (data) => console.error(`stderr: ${data}`));
    }
    restartServer() {
        console.log(`\x1b[33m 🔄 File ${this.lastFileChanged} was changed, restarting server... \x1b[0m`);
        this.server.kill();
        this.startServer();
    }

    debounce(func, wait) {
        return (...args) => {
            if (this.timeout) clearTimeout(this.timeout);
            const later = () => {
                clearTimeout(this.timeout);
                func(...args);
            };
            clearTimeout(this.timeout);
            this.timeout = setTimeout(later, wait);
        };
    }

    watchFiles() {
        watch(this.rootPath, { recursive: true }, async (eventType, filename) => {
            const path = resolve(this.rootPath, filename);
            if (!existsSync(path) || filename.includes('~')) return;
            const stats = await lstat(resolve(this.rootPath, filename));
            if (!stats.isFile()) return;
            if (this.ignoredPatterns.some((pattern) => pattern.test(filename))) return;
            this.lastFileChanged = filename;
            this.debouncedRestart();

        });
    }

    getIgnoredPatterns(root) {
        const gitignoreToRegExp = (pattern) => {
            // Convert glob syntax to RegExp syntax
            let regExp = pattern.replace(/([.?+^$[\]\\(){}|-])/g, '\\$1'); // escape special RegExp characters
            regExp = regExp.replace(/\*\*/g, '.*'); // '**' matches any number of directories
            regExp = regExp.replace(/\*/g, '[^/]*'); // '*' matches any number of non-directory characters
            regExp = regExp.replace(/\/$/, '(?:/|$)'); // if the pattern ends with '/', it should match either '/' or the end of the string
            regExp = '^' + regExp + '$'; // the pattern should match the whole string

            return new RegExp(regExp);
        };
        const ignoredPatterns = [/node_modules/, /dist/, /build/, /coverage/, /test/,
                                 /public/, /out/, /temp/, /.idea/, /.vscode/, /.git/,
                                 /.github/, /.*\.log/];

        const gitignore = resolve(root, '.gitignore');
        if (existsSync(gitignore)) {

            const patterns = readFileSync(gitignore, 'utf8').split('\n');
            patterns.forEach((pattern) => {
                if (pattern.trim() !== '') {
                    ignoredPatterns.push(new RegExp(gitignoreToRegExp(pattern)));
                }
            });
        }
        return ignoredPatterns;

    }
}

const hotReload = new HotReload('main.js');
hotReload.run();
