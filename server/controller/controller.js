/**
 * controller for one route
 */

export class ApiController {
    constructor({ initialState, persistState }) {
        this.persistState = persistState || false;
        this.routes = [];
        this.state = initialState || {};
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

    use(request, response) {
        const route = this.routes.find((r) => r.route === request.url);
        if (!route) {
            return { handled: false };
        }
        route.routeAction(request, response);
        return { handled: true };
    }

    addRoute({ route, routeAction }) {}
}
