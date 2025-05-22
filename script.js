const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const restartBtn = document.getElementById('restart-btn');

const scale = 20;
const rows = canvas.height / scale;
const cols = canvas.width / scale;

let snake;
let food;
let score;
let gameInterval;
let speed = 150;

// Snake class definition
class Snake {
    constructor() {
        this.reset();
    }

    reset() {
        this.body = [{ x: Math.floor(cols / 2), y: Math.floor(rows / 2) }];
        this.xSpeed = 1;
        this.ySpeed = 0;
        this.pendingDirection = null;
    }

    draw() {
        ctx.fillStyle = '#27ae60';
        for (let segment of this.body) {
            ctx.fillRect(segment.x * scale, segment.y * scale, scale, scale);
        }
    }

    update() {
        if (this.pendingDirection) {
            this.xSpeed = this.pendingDirection.x;
            this.ySpeed = this.pendingDirection.y;
            this.pendingDirection = null;
        }

        const head = { x: this.body[0].x + this.xSpeed, y: this.body[0].y + this.ySpeed };
        // Wrap around edges
        head.x = (head.x + cols) % cols;
        head.y = (head.y + rows) % rows;

        // Check self-collision
        for (let segment of this.body) {
            if (head.x === segment.x && head.y === segment.y) {
                gameOver();
                return;
            }
        }

        this.body.unshift(head);

        // Eat food
        if (head.x === food.x && head.y === food.y) {
            score++;
            placeFood();
        } else {
            this.body.pop();
        }
    }

    setDirection(x, y) {
        // Prevent reversing
        if (this.xSpeed === -x || this.ySpeed === -y) return;
        this.pendingDirection = { x, y };
    }
}

function placeFood() {
    food = {
        x: Math.floor(Math.random() * cols),
        y: Math.floor(Math.random() * rows)
    };
    // Ensure food does not spawn on the snake
    for (let segment of snake.body) {
        if (segment.x === food.x && segment.y === food.y) {
            return placeFood();
        }
    }
}

function drawFood() {
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(food.x * scale, food.y * scale, scale, scale);
}

function gameOver() {
    clearInterval(gameInterval);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff';
    ctx.font = '48px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = '24px sans-serif';
    ctx.fillText('Score: ' + score, canvas.width / 2, canvas.height / 2 + 20);
}

function resetGame() {
    snake = new Snake();
    score = 0;
    scoreEl.textContent = score;
    placeFood();
    clearInterval(gameInterval);
    gameInterval = setInterval(loop, speed);
}

function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    snake.update();
    snake.draw();
    drawFood();
    scoreEl.textContent = score;
}

// Handle keyboard controls
window.addEventListener('keydown', e => {
    switch (e.key) {
        case 'ArrowUp':
            snake.setDirection(0, -1);
            break;
        case 'ArrowDown':
            snake.setDirection(0, 1);
            break;
        case 'ArrowLeft':
            snake.setDirection(-1, 0);
            break;
        case 'ArrowRight':
            snake.setDirection(1, 0);
            break;
    }
});

// Restart button event
restartBtn.addEventListener('click', resetGame);

// Initialize the game
resetGame(); 