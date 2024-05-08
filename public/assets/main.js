class ApiCall {
    constructor({ path, query, body, method, name }) {
        this.path = path || '';
        this.query = query || {};
        this.body = body || {};
        this.method = method || 'GET';
        this.name = name || 'Unknown';
        this.id = `${name}${path}${JSON.stringify(query)}${method}`
            .split('')
            .reduce((s, c) => (Math.imul(31, s) + c.charCodeAt(0)) | 0, 0);
    }
}

class Main {
    init() {
        const button = document.querySelector('#callButton');
        console.log('init', button);
        this.select = document.querySelector('#callSelect');
        this.calls().forEach((call) => {
            const option = document.createElement('option');
            option.text = call.name;
            option.value = call.id;
            this.select.add(option);
        });

        this.select.addEventListener('change', (ev) => {
            this.selectionChanged(ev);
        });
        button.onclick = (ev) => this.callApi(ev);
    }

    selectionChanged(ev) {
        console.log('selectionChanged', this.select.value);
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
