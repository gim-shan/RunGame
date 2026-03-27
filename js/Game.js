class GameEngine {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score');
        this.deathOverlay = document.getElementById('death-overlay');
        
        this.resize();
        window.addEventListener('resize', () => this.resize());

        this.player = new Player(this.canvas.width, this.canvas.height);
        this.obstacles = [];
        this.stars = this.createStars();
        
        this.score = 0;
        this.gameActive = false;
        this.currentLevelSpeed = 0;
        this.obstacleTimer = 0;
        this.minGap = 100;
        this.maxGap = 300;
        this.nextSpawnAt = 120;

        // SHAKE VARIABLES
        this.shakeDuration = 0;
        this.shakeIntensity = 7;

        this.keys = {};
        window.addEventListener('keydown', (e) => this.keys[e.code] = true);
        window.addEventListener('keyup', (e) => this.keys[e.code] = false);
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createStars() {
        let s = [];
        for(let i=0; i<150; i++) {
            s.push({ x: Math.random()*this.canvas.width, y: Math.random()*this.canvas.height, size: Math.random()*2.5 });
        }
        return s;
    }

    triggerShake() {
        this.shakeDuration = 15; // Number of frames to shake
    }

    drawBackground() {
        this.ctx.fillStyle = "white";
        this.stars.forEach(s => {
            this.ctx.fillRect(s.x, s.y, s.size, s.size);
            if(this.gameActive) s.x -= 0.5;
            if(s.x < 0) s.x = this.canvas.width;
        });

        const floorY = this.canvas.height - 50;
        this.ctx.strokeStyle = "#4834d4";
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(0, floorY);
        this.ctx.lineTo(this.canvas.width, floorY);
        this.ctx.stroke();
    }

    start(speed) {
        this.initialLevelSpeed = speed;
        this.resetGameVariables();
        this.gameLoop();
    }

    resetGameVariables() {
        this.score = 0;
        this.obstacles = [];
        this.gameActive = true;
        this.obstacleTimer = 0;
        this.shakeDuration = 0;
        this.currentLevelSpeed = this.initialLevelSpeed;
        this.player = new Player(this.canvas.width, this.canvas.height);
        this.deathOverlay.style.display = 'none';
        this.scoreElement.innerText = "0";
    }

    spawnObstacle() {
        this.obstacleTimer++;
        if (this.obstacleTimer >= this.nextSpawnAt) {
            this.obstacles.push(new Obstacle(this.canvas.width, this.canvas.height, this.currentLevelSpeed));
            this.obstacleTimer = 0;
            this.nextSpawnAt = this.minGap + (Math.random() * (this.maxGap - this.minGap));
        }
    }

    gameLoop() {
        // We allow the loop to run even if !gameActive for the shake effect
        this.ctx.save();

        // Apply Screen Shake logic
        if (this.shakeDuration > 0) {
            let dx = (Math.random() - 0.5) * this.shakeIntensity;
            let dy = (Math.random() - 0.5) * this.shakeIntensity;
            this.ctx.translate(dx, dy);
            this.shakeDuration--;
        }

        // Clear and Draw
        this.ctx.fillStyle = "#0a0a19";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawBackground();

        if (this.gameActive) {
            // Input
            if (this.keys['ArrowUp'] || this.keys['Space'] || this.keys['KeyW']) this.player.jump();
            if (this.keys['ArrowDown'] || this.keys['KeyS']) this.player.crouch(true);
            else this.player.crouch(false);
            if (this.keys['ArrowRight'] || this.keys['KeyD']) this.player.moveRight();
            if (this.keys['ArrowLeft'] || this.keys['KeyA']) this.player.moveLeft();

            this.player.update(this.canvas.width, this.canvas.height);
            this.spawnObstacle();

            this.obstacles.forEach((obs, index) => {
                obs.update();
                if (this.checkCollision(this.player, obs)) {
                    this.triggerShake();
                    this.gameOver();
                }
                if (obs.x + obs.width < 0) {
                    this.obstacles.splice(index, 1);
                    this.score += 10;
                    this.scoreElement.innerText = Math.floor(this.score);
                    this.currentLevelSpeed += 0.05;
                }
            });
        }

        // Always draw player and obstacles (even during death shake)
        this.player.draw(this.ctx);
        this.obstacles.forEach(o => o.draw(this.ctx));

        this.ctx.restore();
        requestAnimationFrame(() => this.gameLoop());
    }

    checkCollision(p, o) {
        const pad = 8;
        return p.x + pad < o.x + o.width &&
               p.x + p.width - pad > o.x &&
               p.y + pad < o.y + o.height &&
               p.y + p.height - pad > o.y;
    }

    gameOver() {
        this.gameActive = false;
        document.getElementById('finalScore').innerText = Math.floor(this.score);
        // Show overlay after a tiny delay so player sees the shake
        setTimeout(() => {
            if (!this.gameActive) this.deathOverlay.style.display = 'flex';
        }, 500);
    }

    restart() { this.resetGameVariables(); }
    backToMenu() { location.reload(); }
}

const game = new GameEngine();
function startGame(speed) { game.start(speed); }