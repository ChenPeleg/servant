onconnect = (e) => {
    const port = e.ports[0];
    const evtSource = new EventSource('http://localhost:8000');
    evtSource.addEventListener('message', (e) => {
        port.postMessage(e.data);
    });
    port.start();
};
