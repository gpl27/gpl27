class Snake {
    static gridRows = 16;
    static gridCols = 16;

    constructor(canvas) {
        this.state = "START" // START / RUNNING / PAUSE / END
        this.xPos = [2, 1, 0];
        this.yPos = [0, 0, 0];
        this.xApples = [];
        this.yApples = [];
        this.score = 0;
        this.dir = 'R';
        this.ctx = canvas.getContext("2d");
        this.ctx.textBaseline = "middle";
        this.ctxWidth = canvas.width;
        this.ctxHeight = canvas.height;
        this.RecWidth = this.ctxWidth / Snake.gridCols;
        this.RecHeight = this.ctxHeight / Snake.gridRows;
    }
    handleKey(event) {
        if (this.state === "START") {
            if (event.keyCode == 32)
                this.state = "RUNNING";
        } else if (this.state === "RUNNING") {
            switch (event.keyCode) {
                case 37:
                    if (this.dir != 'R')
                        this.dir = 'L';
                    break;
                case 38:
                    if (this.dir != 'D')
                        this.dir = 'U';
                    break;
                case 39:
                    if (this.dir != 'L')
                        this.dir = 'R';
                    break;
                case 40:
                    if (this.dir != 'U')
                        this.dir = 'D';
                    break;
                case 27: // <ESC>
                    this.state = "PAUSE";
                    break;
            }
        } else if (this.state === "PAUSE") {
            if (event.keyCode == 27)
                this.state = "RUNNING"
        } else if (this.state === "END") {
            if (event.keyCode == 32) {
                this.xPos = [2, 1, 0];
                this.yPos = [0, 0, 0];
                this.xApples = [];
                this.yApples = [];
                this.score = 0;
                this.dir = 'R';
                this.state = "RUNNING";
            }
        }
    }
    update() {
        if (this.state === "START") {

        } else if (this.state === "RUNNING") {
            // Update snake pos
            for (let i = this.xPos.length - 1; i > 0; i--) {
                this.xPos[i] = this.xPos[i - 1];
                this.yPos[i] = this.yPos[i - 1];
            }
            switch (this.dir) {
                case 'L':
                    this.xPos[0]--;
                    break;
                case 'U':
                    this.yPos[0]--;
                    break;
                case 'R':
                    this.xPos[0]++;
                    break;
                case 'D':
                    this.yPos[0]++;
                    break;
            }
            // Collision
            if (this.xPos[0] < 0 || this.xPos[0] >= Snake.gridCols) {
                this.state = "END";
            }
            if (this.yPos[0] < 0 || this.yPos[0] >= Snake.gridRows) {
                this.state = "END";
            }
            for (let i = 1; i < this.xPos.length; i++) {
                if (this.xPos[0] == this.xPos[i] && this.yPos[0] == this.yPos[i]) {
                    this.state = "END";
                }
            }
            for (let i = 0; i < this.xApples.length; i++) {
                if (this.xPos[0] == this.xApples[i] && this.yPos[0] == this.yApples[i]) {
                    this.xApples.splice(i, 1);
                    this.yApples.splice(i, 1);
                    this.xPos.splice(0, 0, this.xPos[0]);
                    this.yPos.splice(0, 0, this.yPos[0]);
                    this.score += 100;
                }
            }
            // Spawn apples
            if (Math.random() <= 0.10) {
                let x = Math.floor(Math.random() * Snake.gridCols);
                let y = Math.floor(Math.random() * Snake.gridRows);
                this.xApples.push(x);
                this.yApples.push(y);
            }
        } else if (this.state === "PAUSE") {

        } else if (this.state === "END") {

        }
    }
    draw() {
        this.ctx.clearRect(0, 0, this.ctxWidth, this.ctxHeight);
        this.ctx.font = "32px monospace";
        if (this.state === "START") {
            let text = "Snake Game";
            let textSize = this.ctx.measureText(text);
            let gapX = (this.ctxWidth - textSize.width)/2;
            let gapY = this.ctxHeight/2;
            this.ctx.fillStyle = "black";
            this.ctx.fillText(text, gapX, gapY);
        } else if (this.state === "RUNNING" || this.state === "PAUSE" || this.state === "END") {
            for (let i = 0; i < this.xPos.length; i++) {
                this.ctx.fillStyle = (i % 2 == 0)? "yellow" : "orange";
                let x = this.xPos[i]*this.RecWidth;
                let y = this.yPos[i]*this.RecHeight;
                this.ctx.fillRect(x, y, this.RecWidth, this.RecHeight);
            }
            this.ctx.fillStyle = "red";
            for (let i = 0; i < this.xApples.length; i++) {
                let x = this.xApples[i]*this.RecWidth;
                let y = this.yApples[i]*this.RecHeight;
                this.ctx.fillRect(x, y, this.RecWidth, this.RecHeight);
            }
            if (this.state === "PAUSE") {
                let text = "PAUSED";
                let textSize = this.ctx.measureText(text);
                let gapX = (this.ctxWidth - textSize.width)/2;
                let gapY = this.ctxHeight/2;
                this.ctx.fillStyle = "black";
                this.ctx.fillText(text, gapX, gapY);
            }
            if (this.state === "END") {
                let text = "GAME OVER";
                let textSize = this.ctx.measureText(text);
                let gapX = (this.ctxWidth - textSize.width)/2;
                let gapY = this.ctxHeight/2;
                this.ctx.fillStyle = "black";
                this.ctx.fillText(text, gapX, gapY);
            }
            let text = `${this.score}`;
            let textSize = this.ctx.measureText;
            this.ctx.fillStyle = "black";
            this.ctx.font = "16px monospace";
            this.ctx.fillText(text, 4, 12);
        } 
    }
}
function main() {
    const canvas = document.getElementById("canvas");
    canvas.height = window.innerHeight * 0.75;
    canvas.width = canvas.height;
    const snake = new Snake(canvas);
    document.addEventListener("keydown", (e) => {
        snake.handleKey(e);
    });
    setInterval(() => {
        snake.update();
        snake.draw();
    }, 166); // 5 FPS
}

document.addEventListener("DOMContentLoaded", main);