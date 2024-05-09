/**
 * controller for one route
 */
import { writeFile, readFile } from 'node:fs/promises';

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
        const pathParts = path.split('/');
        const requestParts = request.url.split('/');
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
            ).then(() => {
                console.log('state saved');
            });
        }
        return { handled: true };
    }

    addRoute({ route, routeAction }) {
        this.routes.push({ route, routeAction });
        return this;
    }
}
