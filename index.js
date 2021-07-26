const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const port = 3000;

const players = [];

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});


io.on('connection', socket => {
    emitOnlineUsers();
    socket.on('enterGame', data => {
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

        emitOnlineUsers();
    });

    socket.on('disconnect', () => {
        leaveGame(socket);
    });

    socket.on('leavegame', () => {
        leaveGame(socket);
    });

    socket.on('replayGame', () => {
        const player = players.find(player => player.id = socket.id);
        if (player) {
            player.active = true;
            player.score = 0;
        }
    })

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
        players.splice(index, 1);
    }
    emitOnlineUsers();
}

function emitOnlineUsers() {
    io.emit('onlineUsers', players.filter(player => player.active).length);
}

function emitTopList(socket) {
    io.emit('top10list', {
        list: players.slice(0, 3),
        total: players.length,
        rank: players.findIndex(player => player.id == socket.id) + 1,
        playerId: socket.id
    });
}