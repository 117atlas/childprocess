const http = require('http');

const host = 'localhost';
const port = 8000;

const { fork } = require('child_process');

const slowFunction = () => {
    let counter = 0;
    while (counter < 5000000000) {
        counter++;
    }
    return counter;
}

const requestListener = function (req, res) {
    if (req.url === '/total') {
        let child = fork(__dirname + '/getcount.js');
        child.on('message', message => {
            console.log('Returning /total results');
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(200);
            res.end(message);
            //child.
        });
        child.send('start');

    } else if (req.url === '/hello') {
        console.log('Returning /hello results');
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(200);
        res.end(`{"message":"hello"}`);
    }
};

const server = http.createServer(requestListener);
server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});
