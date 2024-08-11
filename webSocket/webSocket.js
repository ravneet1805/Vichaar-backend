const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

// Object to store WebSocket connections by user ID
const clients = {};

wss.on('connection', (ws,req) => {
  console.log('Client connected');
  const userId = req.url.split('userId=')[1];

  // Store the WebSocket connection by user ID
  clients[userId] = ws;

  ws.on('message', (message) => {
    console.log('Received:', message);
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

console.log('WebSocket server running on port 8080');

  

  const broadcastNotification = (userId,notification) => {
    console.log('Broadcast function called');
    console.log(`Number of clients: ${wss.clients.size}`);

//     const client = clients[userId];
  
//     wss.clients.forEach((client) => {
//       console.log('Inside forEach loop');
//       if (client.readyState === WebSocket.OPEN) {
//         console.log('Sending notification');
//         client.send(JSON.stringify(notification));
//       } else {
//         console.log('Client is not open');
//       }
//     });
//   };


const client = clients[userId];
if (client && client.readyState === WebSocket.OPEN) {
    console.log('Sending notification');
  client.send(JSON.stringify(notification));
} else {
  console.log(`User ${userId} is not connected.`);
}
  };
  

module.exports = {broadcastNotification}