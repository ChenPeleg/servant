// open websocket to localhost 8000
// server.start();
//
//

onconnect = (e) => {
    const port = e.ports[0];
    // fetch('http://localhost:8000').then((response) => {
    //     response.text().then((data) => {
    //         console.log(data);
    //         port.postMessage(data);
    //     });
    // });
    port.postMessage('new event source');
    const evtSource = new EventSource('http://localhost:8000');
    evtSource.addEventListener('message', (e) => {
        console.log('Message from HTML server: ', e.data);
        // port.postMessage(e.data);
    });
    port.addEventListener('message', (e) => {
        const workerResult = `Result: ${e.data}`;
        port.postMessage(workerResult);
    });

    port.start();
};
