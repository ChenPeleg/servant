// open websocket to localhost 8000
// server.start();
//
// d

onconnect = (e) => {
    const port = e.ports[0];
    
    port.postMessage('new event source');
    const evtSource = new EventSource('http://localhost:8000');
    evtSource.addEventListener('message', (e) => {
        port.postMessage(e.data);
    });
    port.start();
};
