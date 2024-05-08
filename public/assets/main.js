class ApiCall {
    constructor({ path, query, body, method, name }) {
        this.path = path || '';
        this.query = query || {};
        this.body = body || {};
        this.method = method || 'GET';
    }
}

class Main {
    init() {
        const button = document.querySelector('#callButton');
        console.log('init', button);
        this.select = document.querySelector('#callSelect');
        button.onclick = (ev) => this.callApi(ev);
    }

    callApi(ev) {
        console.log('callApi', this.select.value);
    }

    calls() {
        return [
            new ApiCall({
                path: '/api/first',
                method: 'GET',
                name: 'First',
            }),
            new ApiCall({
                path: '/api/second',
                method: 'GET',
                name: 'Second',
            }),
            new ApiCall({
                path: '/api/third',
                method: 'GET',
                name: 'Third',
            }),
        ];
    }
}

console.log(3);
new Main().init();
