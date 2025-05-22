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

// Add helper function to draw rounded rectangles
function drawRoundedRect(x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
}

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
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 10;
        const grad = ctx.createLinearGradient(0, 0, scale, scale);
        grad.addColorStop(0, '#00ff00');
        grad.addColorStop(1, '#006400');
        ctx.fillStyle = grad;
        for (let segment of this.body) {
            drawRoundedRect(segment.x * scale, segment.y * scale, scale, scale, scale * 0.2);
        }
        ctx.restore();
    }

    update() {
        if (this.pendingDirection) {
            this.xSpeed = this.pendingDirection.x;
            this.ySpeed = this.pendingDirection.y;
            this.pendingDirection = null;
        }

        const head = { x: this.body[0].x + this.xSpeed, y: this.body[0].y + this.ySpeed };
        // Check for border collision
        if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows) {
            gameOver();
            return;
        }

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
    ctx.save();
    const centerX = food.x * scale + scale / 2;
    const centerY = food.y * scale + scale / 2;
    const grad = ctx.createRadialGradient(centerX, centerY, scale * 0.1, centerX, centerY, scale * 0.5);
    grad.addColorStop(0, '#ffcccc');
    grad.addColorStop(0.5, '#ff0000');
    grad.addColorStop(1, '#880000');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(centerX, centerY, scale * 0.4, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
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