/*!
 *  Snake Game
 *  gpl27
 *
 * 
 */
const KEY_CODE = {
    ESC: 27,
    SPACE: 32,
    L_ARROW: 37,
    U_ARROW: 38,
    R_ARROW: 39,
    D_ARROW: 40
}

const DEFAULT_SETTINGS = {
    gameHeight: 0.75,
    gridRows: 32,
    gridCols: 32
}

class Snake {
    static gameHeight = 0.75;
    static gridRows = 32;
    static gridCols = 32;
    static DEFAULT_STATE = {
        state: "START", // START / RUNNING / PAUSE / END
        score: 0,
        xApples: [],
        yApples: [],
    }
    static DEFAULT_SNAKE = {
        dir: 'R',
        xPos: [2, 1, 0],
        yPos: [0, 0, 0]
    }

    constructor(canvas, settings) {
        this.game = structuredClone(Snake.DEFAULT_STATE);
        this.snake = structuredClone(Snake.DEFAULT_SNAKE);
        this.gridRows = settings.gridRows;
        this.gridCols = settings.gridCols;
        let vh = (window.innerHeight * settings.gameHeight) / this.gridRows;
        canvas.height = Math.trunc(vh) * this.gridRows;
        let sqSize = canvas.height / this.gridRows;
        canvas.width = (sqSize) * this.gridCols;
        this.canvas = {
            ctx: canvas.getContext("2d"),
            ctxWidth: canvas.width,
            ctxHeight: canvas.height,
            RecSize: sqSize,
            font: `${sqSize*3}px monospace`
        };
        this.canvas.ctx.textBaseline = "middle";
    }

    handleKey(event) {
        if (this.game.state === "START") {
            if (event.keyCode == KEY_CODE.SPACE) this.game.state = "RUNNING";
        } else if (this.game.state === "RUNNING") {
            switch (event.keyCode) {
                case KEY_CODE.L_ARROW:
                    if (this.snake.dir != 'R') this.snake.dir = 'L';
                    break;
                case KEY_CODE.U_ARROW:
                    if (this.snake.dir != 'D') this.snake.dir = 'U';
                    break;
                case KEY_CODE.R_ARROW:
                    if (this.snake.dir != 'L') this.snake.dir = 'R';
                    break;
                case KEY_CODE.D_ARROW:
                    if (this.snake.dir != 'U') this.snake.dir = 'D';
                    break;
                case KEY_CODE.ESC: // <ESC>
                    this.game.state = "PAUSE";
                    break;
            }
        } else if (this.game.state === "PAUSE") {
            if (event.keyCode == KEY_CODE.ESC) this.game.state = "RUNNING";
        } else if (this.game.state === "END") {
            if (event.keyCode == KEY_CODE.SPACE) {
                this.snake = structuredClone(Snake.DEFAULT_SNAKE);
                this.game = structuredClone(Snake.DEFAULT_STATE);
            }
        }
    }

    update() {
        if (this.game.state === "RUNNING") {
            // Update snake pos
            for (let i = this.snake.xPos.length - 1; i > 0; i--) {
                this.snake.xPos[i] = this.snake.xPos[i - 1];
                this.snake.yPos[i] = this.snake.yPos[i - 1];
            }
            switch (this.snake.dir) {
                case 'L':
                    this.snake.xPos[0]--;
                    break;
                case 'U':
                    this.snake.yPos[0]--;
                    break;
                case 'R':
                    this.snake.xPos[0]++;
                    break;
                case 'D':
                    this.snake.yPos[0]++;
                    break;
            }
            // Check Collisions
            if (this.snake.xPos[0] < 0 ||
                this.snake.xPos[0] >= this.gridCols) {
                this.game.state = "END";
            }
            if (this.snake.yPos[0] < 0 ||
                this.snake.yPos[0] >= this.gridRows) {
                this.game.state = "END";
            }
            for (let i = 1; i < this.snake.xPos.length; i++) {
                if (this.snake.xPos[0] == this.snake.xPos[i] &&
                    this.snake.yPos[0] == this.snake.yPos[i]) {
                    this.game.state = "END";
                }
            }
            for (let i = 0; i < this.game.xApples.length; i++) {
                if (this.snake.xPos[0] == this.game.xApples[i] &&
                    this.snake.yPos[0] == this.game.yApples[i]) {
                    this.game.xApples.splice(i, 1);
                    this.game.yApples.splice(i, 1);
                    this.snake.xPos.splice(0, 0, this.snake.xPos[0]);
                    this.snake.yPos.splice(0, 0, this.snake.yPos[0]);
                    this.game.score += 100;
                }
            }
            // Spawn apples
            if (Math.random() <= 0.10) {
                let x = Math.floor(Math.random() * this.gridCols);
                let y = Math.floor(Math.random() * this.gridRows);
                this.game.xApples.push(x);
                this.game.yApples.push(y);
            }
        }
    }

    drawText(text, color, font=this.canvas.font) {
        this.canvas.ctx.fillStyle = color;
        this.canvas.ctx.font = font;
        let textSize = this.canvas.ctx.measureText(text);
        let gapX = (this.canvas.ctxWidth - textSize.width) / 2;
        let gapY = this.canvas.ctxHeight / 2;
        this.canvas.ctx.fillText(text, gapX, gapY);
    }

    draw() {
        this.canvas.ctx.clearRect(0,
                                  0,
                                  this.canvas.ctxWidth,
                                  this.canvas.ctxHeight);
        if (this.game.state === "START") {
            this.drawText("Snake Game", "black");
        } else if (this.game.state === "RUNNING" ||
                   this.game.state === "PAUSE" ||
                   this.game.state === "END") {
            // Draw Snake
            for (let i = 0; i < this.snake.xPos.length; i++) {
                this.canvas.ctx.fillStyle = (i % 2 == 0) ? "yellow" : "orange";
                let x = this.snake.xPos[i] * this.canvas.RecSize;
                let y = this.snake.yPos[i] * this.canvas.RecSize;
                this.canvas.ctx.fillRect(x,
                                         y,
                                         this.canvas.RecSize,
                                         this.canvas.RecSize);
            }
            // Draw Apples
            this.canvas.ctx.fillStyle = "red";
            for (let i = 0; i < this.game.xApples.length; i++) {
                let x = this.game.xApples[i] * this.canvas.RecSize;
                let y = this.game.yApples[i] * this.canvas.RecSize;
                this.canvas.ctx.fillRect(x,
                                         y,
                                         this.canvas.RecSize,
                                         this.canvas.RecSize);
            }
            if (this.game.state === "PAUSE") {
                this.drawText("PAUSED", "black");
            }
            if (this.game.state === "END") {
                this.drawText("GAME\nOVER", "black");
            }
            let text = `${this.game.score}`;
            this.canvas.ctx.fillStyle = "black";
            this.canvas.ctx.font = `${this.canvas.RecSize}px monospace`;
            this.canvas.ctx.fillText(text,
                                     this.canvas.RecSize/2,
                                     this.canvas.RecSize);
        }
    }

    loop() {
        this.update();
        this.draw();
    }
}

function main() {
    const canvas = document.getElementById("canvas");
    const snake = new Snake(canvas, DEFAULT_SETTINGS);
    document.addEventListener("keydown", (e) => {
        snake.handleKey(e);
    });
    setInterval(() => { snake.loop() }, 166); // 5 FPS
}

document.addEventListener("DOMContentLoaded", main);