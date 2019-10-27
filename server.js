const express = require('express'); 
const http = require('http'); 
const WebSocket = require('ws'); 

require('dotenv').config()

const app = express()

// initializing a simple http server
const server = http.createServer(app);

// creating the websocket server
const wss = new WebSocket.Server({ server });

// saying that when there is an oncoming connection, this function will run
wss.on('connection', ws => {

    // console.log(ws); 


    //connection is up, let's add a simple simple event
    ws.on('message', message => {

        //log the received message and send it back to the client
        console.log('received: %s', message);

        const broadcastRegex = /^broadcast\:/;

        if (broadcastRegex.test(message)) {
            message = message.replace(broadcastRegex, '');

            //send back the message to the other clients
            wss.clients
                .forEach(client => {
                    if (client !== ws) {
                        client.send(`Hello, broadcast message -> ${message}`);
                    }
                });
        } else {
            ws.send(`Hello, you sent -> ${message}`);
        }
    });

    // immediately sending feedback to the incoming connection, will be replaced by the above function
    ws.send('Hi there, I am a WebSocket Server!');

})

// handling broken connections
wss.on('connection', ws => {

    ws.isAlive = true;

    ws.on('pong', () => {
        ws.isAlive = true;
    });

    // //connection is up, let's add a simple simple event
    // ws.on('message', message => { 
    //     //[...]
    //     console.log()
    // })
});

setInterval(() => {
    wss.clients.forEach(ws => {
        
        if (!ws.isAlive) return ws.terminate();
        
        ws.isAlive = false;
        ws.ping(null, false, true);
    });
}, 10000);

//start our server
server.listen(process.env.PORT || 8999, () => {
    console.log(`Server started on port ${server.address().port} :)`);
});


