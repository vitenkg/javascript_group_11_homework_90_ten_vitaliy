const express = require('express');
const cors = require('cors');
const {nanoid} = require('nanoid');
const app = express();

require('express-ws')(app);

const port = 8000;

app.use(cors());

const activeConnections = {};

app.ws('/chat', (ws, req) => {
  const id = nanoid();
  activeConnections[id] = ws;

  let username = 'Anonymous';
  ws.send(JSON.stringify({
    type: 'CONNECTED',
    username,
  }));

  ws.on('message', msg => {
    const decoded = JSON.parse(msg);

    switch (decoded.type) {
      case 'CREATE_MESSAGE':
        Object.keys(activeConnections).forEach(key => {
          const connection = activeConnections[key];
          connection.send(JSON.stringify({
            type: 'NEW_MESSAGE',
            message: {
              username,
              text: decoded.message,
            },
          }))
        })
        break;
      case 'CHANGE_USERNAME':
        username = decoded.username;
        console.log(username);
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