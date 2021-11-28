const express = require('express');
const cors = require('cors');
const {nanoid} = require('nanoid');
const app = express();

require('express-ws')(app);

const port = 8080;

app.use(cors());

const activeConnections = {};
const historyArray = [];

app.ws('/draw', (ws, req) => {
  const id = nanoid();
  activeConnections[id] = ws;

  ws.send(JSON.stringify({
    type: "CONNECTED",
    message: historyArray,
  }));

  ws.on('message', msg => {
    const decoded = JSON.parse(msg);

    historyArray.push(decoded.message);

    switch (decoded.type) {
      case 'CREATE_DRAW':
        Object.keys(activeConnections).forEach(key => {
          const connection = activeConnections[key];

          if (connection !== ws) {
            connection.send(JSON.stringify({
              type: 'NEW_DRAW',
              message: decoded.message,
            }))
          }

        });
        break;

      default:
        console.log('Unknown Type: ', decoded.type);
        break;
    }
  });

  ws.on('close', () => {
    delete activeConnections[id];
    console.log('Client was disconnected id = ' + id);
  });
  console.log('client connected id=' + id);
});

app.listen(port, () => {
  console.log("server is started on " + port);
});