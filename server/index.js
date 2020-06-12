const express = require('express');
const app     = express();
const http    = require('http').createServer(app);
const io      = require('socket.io')(http);

app.use(express.static(__dirname + '/../client'));

http.listen(3000);

console.log('Server is listening on http://localhost:3000');

const users = {};
const typers = {}

io.on('connection', socket => {
    console.log('connected...');

    socket.on('user connected', payload => {
        users[socket.id] = {
            id: socket.id,
            name: payload.name,
            avatar: payload.avatar
        };

        socket.broadcast.emit('user connected', users[socket.id]);
    });

    socket.on('user typing', () => {
        typers[socket.id] = 1;

        socket.broadcast.emit('user typing', {
            user: users[socket.id].name,
            typers: Object.keys(typers).length
        });
    });

    socket.on('user stopped typing', () => {
        delete typers[socket.id];

        socket.broadcast.emit('user stopped typing', Object.keys(typers).length);
    });

    socket.on('send message', payload => {
        delete typers[socket.id];

        socket.broadcast.emit('send message', {
            user: payload.user,
            message: payload.message,
            typers: Object.keys(typers).length
        });
    });
});
  