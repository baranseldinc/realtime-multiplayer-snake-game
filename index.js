const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const fs = require('fs');
const port = 5000;

const players = [];

server.listen(process.env.PORT || port, () => {
    console.log(`Server is running on port ${port}`);
});


app.get('/', (req, res) => {
    trace(req, "req", "/");
    const indexFile = __dirname + '/public/index.html';

    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    let data = fs.readFileSync(indexFile, 'utf8');

    result = data.replace(/{ CLIENT }/g, `{ip_addr: '${ip}' }`);
    res.send(result);
});

app.get('/trace', (req, res) => {
    trace(req, "req", "/trace");
    res.sendFile(__dirname + '/persistence/trace.txt');
});

app.use(express.static(__dirname + '/public'));


io.on('connection', socket => {
    emitOnlineUsers();
    socket.on('enterGame', data => {
        console.log(data);
        const player = players.find(player => player.playerId == socket.id);
        if (player) {
            player.playerName = data.playerName;
            player.score = 0;
            player.active = true;
        } else {
            players.push({
                playerId: socket.id,
                playerName: data.playerName,
                score: 0,
                active: true
            });
        }
        trace(socket, "socket", "enterGame " + data.playerName);

        emitOnlineUsers();
    });

    socket.on('disconnect', () => {
        leaveGame(socket);
    });

    socket.on('leavegame', () => {
        leaveGame(socket);
    });

    socket.on('updateScore', data => {
        let player = players.find(item => item.playerId == socket.id);
        if (player) {
            player.score = data;
        }

        players.sort((a, b) => a.score > b.score ? -1 : 1);


        emitTopList(socket);
    });

    socket.on('gameOver', () => {
        let player = players.find(item => item.playerId == socket.id);
        if (player) {
            player.active = false;
        }
        emitTopList(socket);
    });

    socket.on('test', data => {
        console.log(players);
    })

});

function leaveGame(socket) {
    let index = players.findIndex(item => item.playerId == socket.id);
    if (index > -1) {
        trace(socket, "socket", "leaveGame " + players[index].playerName);
        players.splice(index, 1);
    }
    emitOnlineUsers();
}

function emitOnlineUsers() {
    io.emit('onlineUsers', players.filter(player => player.active).length);
}

function emitTopList(socket) {
    io.emit('topList', {
        list: players.slice(0, 3),
        total: players.length,
        rank: players.findIndex(player => player.id == socket.id) + 1,
        playerId: socket.id
    });
}

function trace(req, reqType, msg) {

    const ip = reqType == "req" ? req.headers['x-forwarded-for'] || req.socket.remoteAddress
        : req.handshake.address;
    const datetime = new Date().toLocaleString('en-US', {
        timeZone: 'Europe/Istanbul'
    });

    let traceMsg = datetime + ' ' + ip + ' ' + msg;

    fs.appendFile(__dirname + '/persistence/' + 'trace.txt', traceMsg + '\n', function (err) {
        if (err) throw err;
    });
}