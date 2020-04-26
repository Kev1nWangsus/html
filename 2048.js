// Constant
ANIMATION_TIME = 0.15;
FRAME_PER_SECOND = 60;
GAME_SIZE = 4;
CANVAS_SIZE = 600;
BLOCK_SIZE = 130;

MARGIN_SIZE = (CANVAS_SIZE - BLOCK_SIZE * GAME_SIZE) / 5;

CANVAS_BACKGROUND_COLOR = "dce4eb";
BLOCK_PLACEHOLDER_COLOR = "c1cdd7";
BLOCK_BACKGROUND_COLOR_LIST = ["b1cde7", "9ec0e0", "97bcde", "8bb4da", "77a7d4", "649bce", "3d82c2", "31689b", "254e74", "254e74", "18344e"];



// Global Utility Functions
randInt = function(a, b) {
    return a + Math.floor(Math.random() *(b+1-a));
}

randChoice = function(arr) {
    return arr[randInt(0, arr.length-1)]
}

sum = function (arr) {
    var res = 0;
    for (var i = 0; i < arr.length; i++) {
        for (var j = 0; j < arr[i].length; j++) {
            res += arr[i][j];
        }
    }
    return res;
}

copyArray = function(arr1) {
    var arr2 = [];
    for (let i = 0; i < arr1.length; i++) {
        let tmp = [];
        for (let j = 0; j < arr1[i].length; j++) {
            tmp.push(arr1[i][j]);
        }
        arr2.push(tmp);
    }
    return arr2;
}

compareArray = function(arr1, arr2) {
    if (arr1.length != arr2.length) {
        return false;
    }
    for (var i = 0; i < arr1.length; i++) {
        for (var j = 0; j < arr1[i].length; j++) {
            if (arr1[i][j] != arr2[i][j]) {
                return false;
            }
        }
    }
    return true;
}


// Model
class Game {
    constructor() {
        this.data = [];
        this.score = 0;
        this.initializeData();
        this.victory = false;
        this.loss = false;
        this.continue = false;
    }

    initializeData() {
        this.data = [];
        let a = 0;
        for (let i = 0; i < GAME_SIZE; i++) {
            let tmp = []
            for (let j = 0; j < GAME_SIZE; j++) {
                tmp.push(null)
            }
            this.data.push(tmp);
        }
        this.generateNewBlock();
        this.generateNewBlock();
    }

    generateNewBlock() {
        let possiblePositions = [];
        for (let i = 0; i < GAME_SIZE; i++) {
            for (let j = 0; j < GAME_SIZE; j++) {
                if (this.data[i][j] == null) {
                    possiblePositions.push([i, j]);
                }
            }
        }
        let position = randChoice(possiblePositions);
        this.data[position[0]][position[1]] = randChoice([2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 4]);
    }

    /*arr = [2, null, 2, null]
    head pointer(index) -> write
    tail pointer -> head
    tail == null -> tail += 1
    tail != null
    head == null -> *tail to *head && tail += 1
    *head == *tail -> *head *= 2 && head += 1 && tail += 1
    *head != *tail -> head += 1

    [2, 2, 2, 2] -> head = 0; tail = 1;
    [4, null, 2, 2] -> head = 1; tail = 2;
    [4, 2, null, 2] -> head = 1; tail = 3;
    [4, 4, null, null] 
    */
    shiftBlock(arr, reverse=false) {
        let head = 0;
        let tail = 1;
        let incr = 1;
        let moves = [];
        if (reverse == true) {
            head = arr.length - 1;
            tail = head - 1;
            incr = -1;
        }
        while (0 <= tail && tail < arr.length) {
            if (arr[tail] == null) {
                tail += incr;
            } else {
                if (arr[head] == null) {
                    arr[head] = arr[tail];
                    arr[tail] = null;
                    moves.push([tail, head])
                    tail += incr;
                } else if (arr[head] == arr[tail]) {
                    arr[head] = arr[head] * 2;
                    if (arr[head] == 2048) {
                        this.victory = true;
                    }
                    this.score += arr[head]
                    arr[tail] = null;
                    moves.push([tail, head])
                    head += incr;
                    tail += incr;
                } else {
                    head += incr;
                    if (head == tail){
                        tail += incr;
                    }
                }
            }
        }
        return moves;
    }

    advance(command) {
        let reverse = (command == "right" || command == "down")
        let moves = [];
        if (command == "left" || command == "right") {   
            for (let i = 0; i < GAME_SIZE; i++) {
                let rowMove = this.shiftBlock(this.data[i], reverse);
                for (let move of rowMove)
                    moves.push([[i, move[0]], [i, move[1]]]);
            }
        } else if (command == "up" || command == "down") {
            for (let j = 0; j < GAME_SIZE; j++) {
                let tmp = [];
                for (let i = 0; i < GAME_SIZE; i++) {
                    tmp.push(this.data[i][j]);
                }
                let colMove = this.shiftBlock(tmp, reverse);
                for (let move of colMove) {
                    moves.push([[move[0], j], [move[1], j]]);
                }
                for (let i = 0; i < GAME_SIZE; i++) {
                    this.data[i][j] = tmp[i];
                }
            }
        }

        if (moves.length){
            this.generateNewBlock();
            this.score += 2;
        }   

        game.checkGameOver();

        return moves;
    }

    checkGameOver() {
        let row = 0, col = 0;
        for (let i = 0; i < GAME_SIZE; i++) {
            for (let j = 0; j < GAME_SIZE - 1; j++) {
                if (this.data[i][j] && this.data[i][j+1]) {
                    if (this.data[i][j] != this.data[i][j+1]){
                        row++;
                    }
                }
            }
        }
        for (let i = 0; i < GAME_SIZE; i++) {
            for (let j = 0; j < GAME_SIZE - 1; j++) {
                if (this.data[j][i] && this.data[j+1][i]) {
                    if (this.data[j][i] != this.data[j+1][i]){
                        col++;
                    }
                }
            }
        }
        console.log(row);
        console.log(col);
        if (row == 12 && col == 12) {
            this.loss = true;
        }
    }
    
    checkContinue() {
        var con = setTimeout("confirm('Congratulations! You hit 2048!')", 500);
        if (con) {
            this.continue = true;
        } else {
            location.reload();
        }
    }

    showLoss() {
        setTimeout("alert('Oops! You lost. Try again?');location.reload()", 500);        
    }
}

//Tests
class Test {
    static test_shiftBlock() {
        let gameTest = new Game();
        let testCases = [
            [[2, 2, 2, 2], [4, 4, null, null]],
            [[2, 2, null, 2], [4, 2, null, null]],
            [[4, 2, null, 2], [4, 4, null, null]],
            [[2, 4, null, 8], [2, 4, null, 8]],
            [[null, null, null, null], [null, null, null, null]],
            [[null, 4, 4, 8], [8, 8, null, null]]
        ]
        let errFlag = false;

        for (let test of testCases) {
            for (let reverse of [true, false]) {
                let input = test[0].slice();
                let result = test[1].slice();
                if(reverse == true) {
                    input.reverse();
                    result.reverse();
                }
                gameTest.shiftBlock(input, reverse);
                if(!compareArray(input, result)) {
                    errFlag = true;
                    console.log("Error!");
                    console.log(input, result);
                }
            }
        }

        if (!errFlag) {
            console.log("Passed!");
        }
    }
}

// View
class View {
    constructor(game, container) {
        this.game = game;
        this.container = container;
        this.initializeContainer();
        this.blocks = []
    }

    initializeContainer() {
        this.container.style.width = CANVAS_SIZE;
        this.container.style.height = CANVAS_SIZE;
        this.container.style.borderRadius = "20px";
        this.container.style.backgroundColor = CANVAS_BACKGROUND_COLOR;
        this.container.style.position = "relative";
        this.container.style.display = "inline-block";
        this.container.style.fontSize = 58;
    }

    gridToPosition(i, j) {
        let top = i * (BLOCK_SIZE + MARGIN_SIZE) + MARGIN_SIZE;
        let left = j * (BLOCK_SIZE + MARGIN_SIZE) + MARGIN_SIZE;

        return [top, left];
    }
    
    animate(moves) {
        this.doFrame(moves, 0, ANIMATION_TIME);
    }

    doFrame(moves, currTime, totalTime) {
        if (currTime < totalTime) {
            setTimeout(() => {
                this.doFrame(moves, currTime + 1 / FRAME_PER_SECOND, totalTime)
            }, 1 / FRAME_PER_SECOND * 1000);

            for (let move of moves) {
                // moves -> [ [ [i, j], [i, j] ], [] ];
                // move -> [ [i, j], [i, j] ]
                let block = this.blocks[move[0][0]][move[0][1]]
                let origin = this.gridToPosition(move[0][0], move[0][1]);
                let destination = this.gridToPosition(move[1][0], move[1][1]);
                let currPosition = [
                    origin[0] + currTime / totalTime * (destination[0] - origin[0]),
                    origin[1] + currTime / totalTime * (destination[1] - origin[1])                        
                ]
                if (block){
                    block.style.top = currPosition[0];
                    block.style.left = currPosition[1];
                }
            }
        } else {
            view.drawGame();
        }
    }

    drawGame() {
        this.container.innerHTML = "";
        this.blocks = []
        for (let i = 0; i < GAME_SIZE; i++) {
            let tmp = [];
            for (let j = 0; j < GAME_SIZE; j++) {
                this.drawBackgroundBlock(i, j, BLOCK_PLACEHOLDER_COLOR);
                let block = null;
                if (this.game.data[i][j]) {
                    block = this.drawBlock(i, j, this.game.data[i][j]);
                }
                tmp.push(block);
            }
            this.blocks.push(tmp)
        }
        this.drawScore(this.game.score);
    }

    drawScore(score) {
        document.getElementById("score").innerText = score;
    }

    drawBackgroundBlock(i, j, color) {
        let block = document.createElement("div");
        let position = this.gridToPosition(i, j);
        block.style.width = BLOCK_SIZE;
        block.style.height = BLOCK_SIZE;
        block.style.borderRadius = "5px";
        block.style.backgroundColor = color;
        block.style.position = "absolute";
        block.style.top = position[0];
        block.style.left = position[1]; 
        block.style.zIndex = 3;
        this.container.append(block);
        return block;
    }

    drawBlock(i, j, number) {
        let span = document.createElement("span"); // span is an inline block
        let block = this.drawBackgroundBlock(i, j, BLOCK_BACKGROUND_COLOR_LIST[Math.floor(Math.log(number)/Math.log(2))-1]);
        span.innerText = number;
        span.style.textAlign = "center";
        span.style.lineHeight = "130px";
        span.style.color = "white";
        span.style.fontFamily = "Consolas";
        span.style.fontWeight = "bold";
        block.appendChild(span);
        block.style.zIndex = 5;
        return block;
    }

}

// Controller
var container = document.getElementById("game-container");
var game = new Game;
var view = new View(game, container);
view.drawGame();

document.onkeydown = function(event) {
    if (event.key == "ArrowLeft"){
        moves = game.advance("left");
    } else if (event.key == "ArrowRight") {
        moves = game.advance("right");
    } else if (event.key == "ArrowDown") {
        moves = game.advance("down");
    } else if (event.key == "ArrowUp") {
        moves = game.advance("up");
    }

    if (moves.length > 0){
        view.animate(moves);
        if (game.loss) {
            game.showLoss();
        }
        if (game.victory && !game.continue) {
            game.checkContinue();
        }
    }    
}