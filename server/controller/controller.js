/**
 * controller for one route
 */

export class ApiController {
    constructor() {
        this.routes = [];
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
