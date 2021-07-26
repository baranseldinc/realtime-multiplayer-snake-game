const playerList = [];

const main = {
    playerListLength: () => playerList.length,
    enterPlayer: (playerName) => {
        let index = playerList.findIndex(item => item.playerName == playerName);
        if (index !== -1)
            return false;
        playerList.push({
            playerName,
            score: 0
        })
        return true;
    },
    leavePlayer: (playerName) => {
        let index = playerList.findIndex(item => item.playerName == playerName);
        if (index !== -1) {
            playerList.splice(index, 1);
        }
    },
    getPlayer: (playerName) => playerList.find(item => item.playerName == playerName),
    getPlayers: () => playerList

}

module.exports = main;