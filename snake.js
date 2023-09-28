/*!
 *  Snake Game
 *  gpl27

 * TODO:
 *  Add snake head
 *  Add mobile support
 *  Save local highscore
 *  Better text
 *      start/end/pause logo + onscreen instructions
 *  Smoother snake movement
 * 
 * NOTES:
 *  `gameHeight` is a percentage of `window.innerHeight` and the actual
 *  height of the canvas element will be at most that percentage. This is to
 *  avoid floating point coordinates to the canvas api. The canvas will be the
 *  largest height that is a multiple of `gridRows`. I might change this in the
 *  future and use CSS transforms so that the canvas will always be exactly
 *  the `gameHeight` specified. I would also try to "pre-render" the snake
 *  segments and apples instead of drawing them every frame.
 */
class Snake {
    static DEFAULT_SETTINGS = {
        gameHeight: 0.75,
        gridRows: 32,
        gridCols: 32
    }
    static DEFAULT_STATE = {
        state: "START", // START / RUNNING / PAUSE / END
        score: 0,
        xApples: [],
        yApples: [],
    }
    static DEFAULT_SNAKE = {
        prevDir: 'R',
        dir: 'R',
        xPos: [2, 1, 0],
        yPos: [0, 0, 0]
    }
    static snakeColor = "#627bf1";
    static snakeHeadColor = "#4766FF"
    static appleColor = "#ca5329";

    constructor(canvas, settings=Snake.DEFAULT_SETTINGS) {
        this.game = structuredClone(Snake.DEFAULT_STATE);
        this.snake = structuredClone(Snake.DEFAULT_SNAKE);
        this.gridRows = settings.gridRows;
        this.gridCols = settings.gridCols;
        let vh = (window.innerHeight * settings.gameHeight) / (this.gridRows + 2);
        canvas.height = Math.trunc(vh) * this.gridRows;
        let sqSize = canvas.height / this.gridRows;
        canvas.width = (sqSize) * this.gridCols;
        this.canvas = {
            ctx: canvas.getContext("2d"),
            ctxWidth: canvas.width,
            ctxHeight: canvas.height,
            RecSize: sqSize,
            font: `bold ${sqSize*2}px monospace`
        };
        console.log(this.canvas);
        this.canvas.ctx.textBaseline = "middle";
        // Draw background
        for (let i = 0; i < this.gridRows/2; i++) {
            for (let j = 0; j < this.gridCols/2; j++) {
                const x = j * this.canvas.RecSize*2;
                const y = i * this.canvas.RecSize*2;
                this.canvas.ctx.fillStyle = ((i+j)%2)? '#a1c750' : '#add05a';
                this.canvas.ctx.fillRect(x,
                                         y,
                                         this.canvas.RecSize*2,
                                         this.canvas.RecSize*2);
            }
        }
        canvas.style.backgroundImage = `url(${canvas.toDataURL()})`;
        canvas.style.border = `${sqSize}px solid #578a34`;

        document.addEventListener("keydown", (e) => {
            this.handleKey(e);
        });
        setInterval(() => {
            this.update();
            this.draw();
        }, 142); // ~7 FPS
    }

    handleKey(event) {
        if (this.game.state === "START") {
            if (event.code == 'Space') {
                event.preventDefault();
                this.game.state = "RUNNING";
            }
        } else if (this.game.state === "RUNNING") {
            event.preventDefault();
            switch (event.code) {
                case 'KeyA':
                case 'ArrowLeft':
                    if (this.snake.prevDir != 'R') this.snake.dir = 'L';
                    break;
                case 'KeyW':
                case 'ArrowUp':
                    if (this.snake.prevDir != 'D') this.snake.dir = 'U';
                    break;
                case 'KeyD':
                case 'ArrowRight':
                    if (this.snake.prevDir != 'L') this.snake.dir = 'R';
                    break;
                case 'KeyS':
                case 'ArrowDown':
                    if (this.snake.prevDir != 'U') this.snake.dir = 'D';
                    break;
                case 'Escape': // <ESC>
                    this.game.state = "PAUSE";
                    break;
            }
        } else if (this.game.state === "PAUSE") {
            if (event.code == 'Escape') this.game.state = "RUNNING";
        } else if (this.game.state === "END") {
            if (event.code == 'Space') {
                event.preventDefault();
                this.snake = structuredClone(Snake.DEFAULT_SNAKE);
                this.game = structuredClone(Snake.DEFAULT_STATE);
            }
        }
    }

    update() {
        if (this.game.state === "RUNNING") {
            this.snake.prevDir = this.snake.dir;
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

    drawApple(x, y) {
        this.canvas.ctx.fillStyle = Snake.appleColor;
        const xCenter = x + this.canvas.RecSize/2;
        const yCenter = y + this.canvas.RecSize/2;
        const radius = this.canvas.RecSize/2;
        this.canvas.ctx.beginPath();
        this.canvas.ctx.arc(xCenter, yCenter, radius, 0, 2 * Math.PI);
        this.canvas.ctx.fill();
    }

    drawSegment(x, y, color) {
        const cornerRadius = this.canvas.RecSize/4;
        const width = this.canvas.RecSize;
        const height = this.canvas.RecSize;
        this.canvas.ctx.beginPath();
        this.canvas.ctx.arc(x + cornerRadius,
                            y + cornerRadius,
                            cornerRadius,
                            Math.PI,
                            Math.PI * 1.5);
        this.canvas.ctx.arc(x + width - cornerRadius,
                            y + cornerRadius,
                            cornerRadius,
                            Math.PI * 1.5,
                            Math.PI * 2);
        this.canvas.ctx.arc(x + width - cornerRadius,
                            y + height - cornerRadius,
                            cornerRadius,
                            0,
                            Math.PI * 0.5);
        this.canvas.ctx.arc(x + cornerRadius,
                            y + height - cornerRadius,
                            cornerRadius,
                            Math.PI * 0.5,
                            Math.PI);
        this.canvas.ctx.closePath();
        this.canvas.ctx.fillStyle = color;
        this.canvas.ctx.fill();
    }
    drawHead() {
        let x = this.snake.xPos[0] * this.canvas.RecSize;
        let y = this.snake.yPos[0] * this.canvas.RecSize;
        this.drawSegment(x, y, Snake.snakeHeadColor);
    }

    draw() {
        this.canvas.ctx.clearRect(0,
                                  0,
                                  this.canvas.ctxWidth,
                                  this.canvas.ctxHeight);
        if (this.game.state === "START") {
            this.drawText("SNAKE GAME", "white");
        } else if (this.game.state === "RUNNING" ||
                   this.game.state === "PAUSE" ||
                   this.game.state === "END") {
            // Draw Apples
            for (let i = 0; i < this.game.xApples.length; i++) {
                let x = this.game.xApples[i] * this.canvas.RecSize;
                let y = this.game.yApples[i] * this.canvas.RecSize;
                this.drawApple(x, y);
            }
            // Draw Snake
            this.drawHead();
            for (let i = 1; i < this.snake.xPos.length; i++) {
                let x = this.snake.xPos[i] * this.canvas.RecSize;
                let y = this.snake.yPos[i] * this.canvas.RecSize;
                this.drawSegment(x, y, Snake.snakeColor);
            }
            if (this.game.state === "PAUSE") {
                this.drawText("PAUSED", "white");
            }
            if (this.game.state === "END") {
                this.drawText("GAME OVER", "white");
            }
            let text = `${this.game.score}`;
            this.canvas.ctx.fillStyle = "white";
            this.canvas.ctx.font = `bold ${this.canvas.RecSize}px monospace`;
            this.canvas.ctx.fillText(text,
                                     this.canvas.RecSize/2,
                                     this.canvas.RecSize);
        }
    }
}
