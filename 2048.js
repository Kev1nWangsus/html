// Constant
CANVAS_SIZE = 600;
CANVAS_BACKGROUND_COLOR = "dce4eb"
GAME_SIZE = 4;
BLOCK_SIZE = 130;
BLOCK_PLACEHOLDER_COLOR = "aebecb"
MARGIN_SIZE = (CANVAS_SIZE-BLOCK_SIZE*GAME_SIZE)/5;
BLOCK_BACKGROUND_COLOR = "97bcde"

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
    arr2 = [];
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
        this.initializeData();
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
        this.data[position[0]][position[1]] = 2;
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
        if (reverse == true){
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
                    tail += incr;
                } else if (arr[head] == arr[tail]) {
                    arr[head] = arr[head] * 2;
                    arr[tail] = null;
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
        return arr;
    }

    advance(command) {
        let copy = copyArray(this.data);
        let reverse = (command == "right" || command == "down")
        if (command == "left" || command == "right") {
            for (let i = 0; i < GAME_SIZE; i++) {
                this.shiftBlock(this.data[i], reverse);
            }
        } else if (command == "up" || command == "down") {
            for (let j = 0; j < GAME_SIZE; j++) {
                let tmp = [];
                for (let i = 0; i < GAME_SIZE; i++) {
                    tmp.push(this.data[i][j]);
                }
                this.shiftBlock(tmp, reverse);
                for (let i = 0; i < GAME_SIZE; i++) {
                    this.data[i][j] = tmp[i];
                }
            }
        }
        console.log(copy);
        console.log(this.data);
        if (!compareArray(this.data, copy)){
            this.generateNewBlock();
        }   
    }
}

// Tests
// class Test {
//     static compareArray(arr1, arr2){
//         if (arr1.length != arr2.length){
//             return false;
//         }
//     }

//     static test_shiftBlock(){
//         let gameTest = new Game();
//         let testCases = [
//             [[2, 2, 2, 2], [4, 4, null, null]],
//             [[2, 2, null, 2], [4, 2, null, null]],
//         ]
//         let errFlag = false;

//         for (let test of testCases) {
//             for (let reverse of [true, false]){
//                 let input = test[0].slice();
//                 let result = test[1].slice();
//                 if(reverse == true) {
//                     input.reverse();
//                     result.reverse();
//                 }
//                 gameTest.shiftBlock(input, reverse);
//                 if(input != result){
//                     errFlag = true;
//                     console.log("Error!");
//                     console.log(input, result);
//                 }
//             }
            
//         }

//         if (!errFlag) {
//             console.log("Passed!");
//         }
//     }
// }

// View
class View {
    constructor(game, container) {
        this.game = game;
        this.container = container;
        this.initializeContainer();
    }

    initializeContainer() {
        this.container.style.width = CANVAS_SIZE;
        this.container.style.height = CANVAS_SIZE;
        this.container.style.borderRadius = "20px";
        this.container.style.backgroundColor = CANVAS_BACKGROUND_COLOR;
        this.container.style.position = "relative";
        this.container.style.display = "inline-block";
    }

    drawGame() {
        for (let i = 0; i < GAME_SIZE; i++) {
            for (let j = 0; j < GAME_SIZE; j++) {
                this.drawBackgroundBlock(i, j, BLOCK_PLACEHOLDER_COLOR);
                if (this.game.data[i][j]) {
                    this.drawBlock(i, j, this.game.data[i][j]);
                }
            }
        }
        this.drawScore(sum(this.game.data) - 4);
    }

    drawScore(score) {
        document.getElementById("score").innerText=score;
    }
    drawBackgroundBlock(i, j, color) {
        let block = document.createElement("div");
        block.style.width = BLOCK_SIZE;
        block.style.height = BLOCK_SIZE;
        block.style.borderRadius = "5px";
        block.style.backgroundColor = color;
        block.style.position = "absolute";
        block.style.top = i * (BLOCK_SIZE + MARGIN_SIZE) + MARGIN_SIZE;
        block.style.left = j * (BLOCK_SIZE + MARGIN_SIZE) + MARGIN_SIZE; 
        this.container.append(block);
        return block;
    }

    drawBlock(i, j, number) {
        let span = document.createElement("span"); // span is an inline block
        let text = document.createTextNode(number);
        let block = this.drawBackgroundBlock(i, j, BLOCK_BACKGROUND_COLOR);
        span.style.textAlign = "center";
        span.style.lineHeight = "130px";
        span.style.fontFamily = "Consolas";
        span.style.fontWeight = "bold";
        span.style.fontSize = "58px";
        span.appendChild(text);
        block.appendChild(span);
    }

}

// Controller
var container = document.getElementById("game-container");
var game = new Game;
var view = new View(game, container);
view.drawGame();

document.onkeydown = function(event) {
    if (event.key == "ArrowLeft"){
        game.advance("left");
    } else if (event.key == "ArrowRight") {
        game.advance("right");
    } else if (event.key == "ArrowDown") {
        game.advance("down");
    } else if (event.key == "ArrowUp") {
        game.advance("up");
    }
    view.drawGame()
}