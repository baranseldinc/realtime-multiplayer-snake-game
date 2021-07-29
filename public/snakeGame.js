let fps = 1;
let snakeParts = 0;
let timeout = undefined;


const game = {
    keyDownLimit: 10,
    cellSize: 10,
    width: 360,
    height: 270,
    running: true
}

const player = {
    score: 0,
    keyList: []
}

const directions = {
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    LEFT: 37
}

function snakePart(id, top, left, size) {
    this.id = 'sp' + id;
    this.top = top;
    this.left = left;
    this.size = size;
}

const snake = {
    direction: undefined,
    parts: [],
    growUp: false,
    setSpeed: function (speed) { fps = speed; }
}


function initialGame() {
    snake.direction = directions.RIGHT;
    //initial snake part positions
    snake.parts = [
        new snakePart(++snakeParts, 130, 140, 10),
        new snakePart(++snakeParts, 130, 130, 8),
        new snakePart(++snakeParts, 130, 130, 8),
        new snakePart(++snakeParts, 130, 130, 8),
        new snakePart(++snakeParts, 130, 120, 8),
        new snakePart(++snakeParts, 130, 110, 7),
        new snakePart(++snakeParts, 130, 110, 5),
        new snakePart(++snakeParts, 130, 110, 3)
    ];
    snake.setSpeed(10);

    player.score = 0;
    player.keyList = [];
    document.getElementById('score').innerHTML = player.score * 10;

    game.running = true;
    if (timeout)
        clearTimeout(timeout);

}

const food = {
    top: undefined,
    left: undefined
}

function move() {
    if (!snake.growUp) {
        for (let i = snake.parts.length - 1; i > 0; i--) {
            snake.parts[i].top = snake.parts[i - 1].top;
            snake.parts[i].left = snake.parts[i - 1].left;
        }
    } else {
        let newPart = new snakePart(++snakeParts, snake.parts[0].top, snake.parts[0].left, 8);
        snake.parts.splice(1, 0, newPart);
        renderSnakePart(newPart);
        generateFood();
        snake.growUp = false;
    }

    let { top, left } = snake.parts[0];

    if (snake.direction == directions.UP) {
        top -= game.cellSize;
    } else if (snake.direction == directions.RIGHT) {
        left += game.cellSize;
    } else if (snake.direction == directions.DOWN) {
        top += game.cellSize;
    } else if (snake.direction == directions.LEFT) {
        left -= game.cellSize;
    }

    if (top > game.height - game.cellSize) top = 0;
    else if (top < 0) top = game.height - game.cellSize;

    if (left > game.width - game.cellSize) left = 0;
    else if (left < 0) left = game.width - game.cellSize;

    snake.parts[0].top = top;
    snake.parts[0].left = left;
}

function updateSnake() {
    snake.parts.forEach(part => {
        let elem = document.getElementById(part.id);
        let offset = (game.cellSize - part.size) / 2;
        elem.style.cssText = `top:${part.top + offset}px; left:${part.left + offset}px; width: ${part.size}px; height: ${part.size}px;`;
    });
}

function handleKeyDown() {
    let key = player.keyList.shift();
    if (key) {
        snake.direction = key;
    }
}

function detectCollisions() {
    let { top, left } = snake.parts[0];

    // endGame deteciton
    for (let i = 1; i < snake.parts.length; i++) {
        let part = snake.parts[i];
        if (top == part.top && left == part.left) {
            game.running = false;
            emitGaveOver();
            document.getElementById('spanReplay').style.display = "block";
            break;
        }
    }

    // Food detection
    if (top == food.top && left == food.left) {
        player.score++;
        document.getElementById('score').innerHTML = player.score * 10;
        updateScore();
        snake.setSpeed(10 + player.score);
        snake.growUp = true;
    }
}

function gameLoop() {
    handleKeyDown();
    move();
    updateSnake();
    detectCollisions();
    if (game.running)
        timeout = setTimeout(gameLoop, 1000 / fps);
}

function renderBoard() {
    document.getElementById('game').style.width = game.width + 'px';
    document.getElementById('game').style.height = game.height + 'px';
    document.getElementById('game').innerHTML = '';
}

function renderSnakePart(part) {
    let divPart = document.createElement("div");
    divPart.setAttribute('id', part.id);
    divPart.classList = 'snakePart';
    divPart.style.cssText = `top:${part.top}px; left:${part.left}px;`;
    document.getElementById('game').appendChild(divPart);
}

function renderSnake() {
    snake.parts.forEach(part => {
        renderSnakePart(part);
    })
}

function generateFood() {
    const { height, width, cellSize } = game;
    food.top = (parseInt(Math.random() * (height / cellSize))) * cellSize;
    food.left = (parseInt(Math.random() * (width / cellSize))) * cellSize;

    let size = 6, offset = (cellSize - size) / 2;
    var foodDiv = document.getElementById('food');
    if (!foodDiv) {
        foodDiv = document.createElement('div');
        foodDiv.id = 'food';
        foodDiv.classList = "food";
        document.getElementById('game').appendChild(foodDiv);
    }
    foodDiv.style.cssText = `height: ${size}px;width: ${size}px;top: ${food.top + offset}px; left: ${food.left + offset}px;`;
}

function startGame() {
    initialGame();
    renderBoard();
    renderSnake();
    generateFood();
    gameLoop();
    document.getElementById('spanReplay').style.display = "none";

}

function enterGame() {
    const playerName = document.getElementById('playerName').value;
    if (!playerName)
        return;
    player.playerName = playerName;
    socket.emit('enterGame', { playerName });
    document.getElementById('lobby').style.display = "none";
    document.getElementById('gamePanel').style.display = "block";
    startGame();
}

function leaveGame() {
    document.getElementById('lobby').style.display = "block";
    document.getElementById('gamePanel').style.display = "none";
    socket.emit('leavegame');
    game.running = false;
}

document.addEventListener('keydown', (e) => {
    if (e && player.keyList.length <= game.keyDownLimit) {
        let lastKey = player.keyList[player.keyList.length - 1] || snake.direction;
        if ((e.keyCode == directions.LEFT || e.keyCode == directions.RIGHT) && (lastKey == directions.UP || lastKey == directions.DOWN))
            player.keyList.push(e.keyCode);
        else if ((e.keyCode == directions.UP || e.keyCode == directions.DOWN) && (lastKey == directions.LEFT || lastKey == directions.RIGHT)) {
            player.keyList.push(e.keyCode);
        }
    }
});