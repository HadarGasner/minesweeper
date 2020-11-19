const MINE = '💥';
const FLAG = '🏁';
const HEART = '❤️ ';
const BLACK_HEART = '🖤 ';
const NORMAL = '🖐️'
const LOSE = '👎'
const WIN = '👏'
const HINT = '🦉'
const SAFE = '🔎'

var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    lives: 3
}

var gLevel = {
    SIZE: 6,
    MINES: 6
};
const gGameTry = 3
var gIsManual = false;
var gManualCounter = 0;
var gSafeCounter = 3
var gOnHint = false;
var gGameInterval
var gBoard;




// This is called when page loads
function initGame() {
    //console.log(localStorage.getItem("bestScore") );
    //localStorage.setItem("bestScore", Infinity);
 
    gBoard = buildBoard();
    renderBoard(gBoard);
    gBoard = createMines(gBoard)
    gBoard = setMinesNegsCount(gBoard)
    renderMineCount();
    renderLives();
    renderMode(NORMAL);
}


function restartGame() {
    clearInterval(gGameInterval)
    gGame.isOn = false
    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        lives: 3
    }
    initGame()
}


function buildBoard() {
    var board = [];
    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = [];
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
        }
    }
    return board
}

function createMines(board) {
    var emptyCells = [];

    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            emptyCells.push({ i: i, j: j });
        }
    }
    for (var i = 0; i < gLevel.MINES; i++) {

        var idx = getRandomIntInclusive(0, emptyCells.length - 1);
        cell = emptyCells.splice(idx, 1)[0];
        board[cell.i][cell.j].isMine = true

    }
    return board
}

function manuallyCreateMine(elCell, i, j) {
    if (!gBoard[i][j].isMine) {
        if (gManualCounter < gLevel.MINES - 1) {
            gManualCounter++
            gBoard[i][j].isMine = true
            elCell.classList.add('manually-cell')
            setTimeout(function () {
                elCell.classList.remove('manually-cell');
            }, 3000);

        } else {
            gBoard[i][j].isMine = true
            elCell.classList.add('manually-cell')
            setTimeout(function () {
                elCell.classList.remove('manually-cell');
            }, 3000);
            gIsManual = false
            setMinesNegsCount(gBoard)
            var elButton = document.querySelector(".manually-create")
            elButton.innerText = 'manually create';
        }
    }
}

function setMinesNegsCount(board) {
    for (var a = 0; a < gLevel.SIZE; a++) {
        for (var b = 0; b < gLevel.SIZE; b++) {
            var mineCounter = 0;

            for (var i = a - 1; i <= a + 1; i++) {
                if (i < 0 || i >= gLevel.SIZE) continue
                for (var j = b - 1; j <= b + 1; j++) {

                    if (a === i && b === j) continue
                    if (j < 0 || j >= gLevel.SIZE) continue

                    if (board[i][j].isMine) {

                        mineCounter++;
                    }
                }
            }
            board[a][b].minesAroundCount = mineCounter;
        }
    }
    return board
}

function renderBoard(board) {
    var strHTML = '<table><tbody>';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < board[0].length; j++) {
            var cell = board[i][j];
            var className = 'cell cell' + i + '-' + j;
            strHTML += '<td oncontextmenu=" cellMarked(this,' + i + ',' + j + '); return false;" contextmenu="menu_id" contextmenu="none" onclick="cellClicked(this,' + i + ',' + j + ')" class="' + className + '"> ' + ' ' + ' </td>'
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>';
    var elContainer = document.querySelector(".board-container");
    elContainer.innerHTML = strHTML;
}

function expandShown(board, elCell, a, b) {

    for (var i = a - 1; i <= a + 1; i++) {
        if (i < 0 || i >= gLevel.SIZE) continue
        for (var j = b - 1; j <= b + 1; j++) {

            if (a === i && b === j) continue
            if (j < 0 || j >= gLevel.SIZE) continue
            var elmentName = '.cell' + i + '-' + j;
            var elCell = document.querySelector(elmentName)
            if (board[i][j].isMine) return

            cellClicked(elCell, i, j);
        }
    }
}

function renderTime() {
    var elTimeCount = document.querySelector('.time-counter')
    elTimeCount.innerText = ++gGame.secsPassed

}

function renderLives() {
    var lives = ''
    for (let i = 0; i < gGameTry; i++) {
        if (i < gGame.lives) {
            lives += HEART
        } else {
            lives += BLACK_HEART
        }

    }
    var elLiveCount = document.querySelector('.live-counter')

    elLiveCount.innerText = lives

}

function clickMine(elCell) {

    cellInner = MINE;
    elCell.classList.add('mine');
    gGame.lives--;
    gGame.markedCount++;
    gGame.shownCount--;
    renderMineCount();
    renderLives();
    if (gGame.lives === 0) {

        clearInterval(gGameInterval);
        console.log('end game');
        gGame.isOn = false;
        renderMode(LOSE)
    }
}

function manuallyCreate(elButton) {
    clearInterval(gGameInterval)
    gGame.isOn = false
    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        lives: 3
    }
    gManualCounter = 0;
    elButton.innerText = 'click on ' + gLevel.MINES + ' cells to put the mines';
    gIsManual = true;
    gBoard = buildBoard();
    renderMineCount();
    renderBoard(gBoard);
    renderLives();
    renderMode(NORMAL);
}

function cellClicked(elCell, i, j) {
    if (gIsManual) {
        manuallyCreateMine(elCell, i, j)
        return
    }
    if (!gGame.isOn && gGame.secsPassed === 0) {
        if (gBoard[i][j].isMine) {
            initGame()
            cellClicked(elCell, i, j);
            return
        }
        console.log('lets start');
        gGame.isOn = true;
        gGameInterval = setInterval(renderTime , 1000);
    }
    if (gOnHint) {
        hintShown(i, j);
        gOnHint = false;
    } else if (!gBoard[i][j].isShown && gGame.isOn) {

        elCell.classList.add('clicked')
        var cell = gBoard[i][j];
        var cellInner = cell.minesAroundCount
        gBoard[i][j].isShown = true;

        if (cellInner === 0) {
            expandShown(gBoard, elCell, i, j);
        }
        if (cell.isMine) {
            cellInner = MINE;
            clickMine(elCell)
        }
        elCell.innerText = cellInner
        gGame.shownCount++
        checkGameOver();
    }
}

function cellMarked(elCell, i, j) {
    var mineCounter = gLevel.MINES - gGame.markedCount;
    if (mineCounter > 0) {
        if (gGame.isOn && !gBoard[i][j].isShown) {
            if (!gBoard[i][j].isMarked) {
                gGame.markedCount++
                gBoard[i][j].isMarked = true;
                elCell.innerText = FLAG;
            } else {
                gBoard[i][j].isMarked = false;
                elCell.innerText = ' ';
                gGame.markedCount--
            }
            renderMineCount()
            checkGameOver()
        }
    }
}

function renderMineCount() {
    var mineCounter = gLevel.MINES - gGame.markedCount;
    var elMineCount = document.querySelector('.mine-counter')
    if (mineCounter > -1) {
        elMineCount.innerText = gLevel.MINES - gGame.markedCount;
    } else {
        elMineCount.innerText = 'used all flags'
    }
}

function checkGameOver() {
    if (gGame.isOn && gLevel.SIZE ** 2 === gGame.markedCount + gGame.shownCount) {

        console.log('win');
        clearInterval(gGameInterval);
        renderMode(WIN);
        bestScore()
        gGame.isOn = false;
    }
}

function bestScore() {

    var elButton = document.querySelector('.best-score')
    if (typeof (Storage) !== "undefined") {
        if (+localStorage.getItem("bestScore") > gGame.secsPassed && gGame.isOn) {
            localStorage.setItem("bestScore", gGame.secsPassed);
            elButton.innerText = 'the best time is ' + localStorage.getItem("bestScore");

        } else {
            elButton.innerText = 'the best time is ' + localStorage.getItem("bestScore");
        }
    } else {
        elButto.innerHTML = "Sorry, your browser does not support Web Storage...";
    }

}

function renderMode(imogi) {
    var elButton = document.querySelector('.restartGame')
    elButton.innerText = imogi;
}


function hint(elButton) {
    //******************minor problrm********************************************
    if (elButton.innerText === HINT) {
        elButton.innerText = ''
        gOnHint = true;
    }
}

function hintShown(a, b) {

    for (var i = a - 1; i <= a + 1; i++) {
        if (i < 0 || i >= gLevel.SIZE) continue
        for (var j = b - 1; j <= b + 1; j++) {
            if (j < 0 || j >= gLevel.SIZE) continue
            if (!gBoard[i][j].isShown) {
                shownForSecend(i, j)
            }
        }
    }
}

function shownForSecend(i, j) {

    var className = '.cell' + i + '-' + j;
    var elCell = document.querySelector(className)
    var oldTXT = elCell.innerText;
    elCell.classList.add('clicked')
    var cell = gBoard[i][j];
    var cellInner = cell.minesAroundCount
    if (cell.isMine) {
        cellInner = MINE;
    }
    elCell.innerText = cellInner
    setTimeout(function () {
        elCell.classList.remove('clicked');
        elCell.innerText = oldTXT;
    }, 1000);
}

function safeClick() {
    if (gSafeCounter > 0) {
        gSafeCounter--;
        var emptyCells = [];

        for (var i = 0; i < gBoard.length; i++) {
            for (var j = 0; j < gBoard[0].length; j++) {
                if (!gBoard[i][j].isMine && !gBoard[i][j].isShown) {
                    emptyCells.push({ i: i, j: j });
                }
            }
        }
        if (emptyCells.length > 0) {
            var idx = getRandomIntInclusive(0, emptyCells.length - 1);
            cell = emptyCells.splice(idx, 1)[0];

            var className = '.cell' + cell.i + '-' + cell.j;
            var elCell = document.querySelector(className)
            elCell.classList.add('safe-click')
            setTimeout(function () {
                elCell.classList.remove('safe-click');
            }, 2000);
        }
    }
}