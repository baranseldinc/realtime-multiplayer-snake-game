function handleClickMobileButtons(e) {
    // let lastKey = player.keyList[player.keyList.length - 1] || snake.direction;
    // if ((e.keyCode == directions.LEFT || e.keyCode == directions.RIGHT) && (lastKey == directions.UP || lastKey == directions.DOWN))
    //     player.keyList.push(e.keyCode);
    // else if ((e.keyCode == directions.UP || e.keyCode == directions.DOWN) && (lastKey == directions.LEFT || lastKey == directions.RIGHT)) {
    //     player.keyList.push(e.keyCode);
    // }
    player.keyList.push(e.keyCode);

}

var btnTopRight = document.getElementById('topRight');
btnTopRight.addEventListener('mousedown', () => {
    let lastKey = player.keyList[player.keyList.length - 1] || snake.direction;
    let e = {}
    if (lastKey == directions.UP || lastKey == directions.DOWN) {
        e.keyCode = directions.RIGHT;
    } else e.keyCode = directions.UP;
    handleClickMobileButtons(e);
});

var btnTopRight = document.getElementById('downLeft');
btnTopRight.addEventListener('mousedown', () => {
    let lastKey = player.keyList[player.keyList.length - 1] || snake.direction;
    let e = {}
    if (lastKey == directions.UP || lastKey == directions.DOWN) {
        e.keyCode = directions.LEFT;
    } else e.keyCode = directions.DOWN;
    handleClickMobileButtons(e);
});