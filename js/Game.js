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
        this.initialLevelSpeed = 0;
        this.currentLevelSpeed = 0;
        this.obstacleTimer = 0;
        this.nextSpawnAt = 120;

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

    drawProgressBar() {
        const width = 200;
        const height = 10;
        const x = this.canvas.width / 2 - width / 2;
        const y = 30;

        let progress = (this.currentLevelSpeed - this.initialLevelSpeed) / 10;
        if (progress > 1) progress = 1;

        this.ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
        this.ctx.fillRect(x, y, width, height);

        this.ctx.fillStyle = "#00d2ff";
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = "#00d2ff";
        this.ctx.fillRect(x, y, width * progress, height);
        this.ctx.shadowBlur = 0;

        this.ctx.fillStyle = "white";
        this.ctx.font = "10px Orbitron";
        this.ctx.fillText("SPEED PROTOCOL", x, y - 10);
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
        this.shakeDuration = 0;
        this.currentLevelSpeed = this.initialLevelSpeed;
        this.player = new Player(this.canvas.width, this.canvas.height);
        this.deathOverlay.style.display = 'none';
        this.scoreElement.innerText = "0";
    }

    gameLoop() {
        this.ctx.save();

        if (this.shakeDuration > 0) {
            this.ctx.translate((Math.random() - 0.5) * this.shakeIntensity, (Math.random() - 0.5) * this.shakeIntensity);
            this.shakeDuration--;
        }

        this.ctx.fillStyle = "#0a0a19";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawBackground();
        this.drawProgressBar();

        if (this.gameActive) {
            if (this.keys['ArrowUp'] || this.keys['Space'] || this.keys['KeyW']) this.player.jump();
            if (this.keys['ArrowDown'] || this.keys['KeyS']) this.player.crouch(true);
            else this.player.crouch(false);
            if (this.keys['ArrowRight'] || this.keys['KeyD']) this.player.moveRight();
            if (this.keys['ArrowLeft'] || this.keys['KeyA']) this.player.moveLeft();

            this.player.update(this.canvas.width, this.canvas.height);

            this.obstacleTimer++;
            if (this.obstacleTimer >= this.nextSpawnAt) {
                this.obstacles.push(new Obstacle(this.canvas.width, this.canvas.height, this.currentLevelSpeed));
                this.obstacleTimer = 0;
                this.nextSpawnAt = 100 + (Math.random() * 200);
            }

            this.obstacles.forEach((obs, index) => {
                obs.update();
                
                // CHECK COLLISION
                if (this.checkCollision(this.player, obs)) {
                    this.shakeDuration = 20; // Hit feedback
                    this.gameActive = false;
                    document.getElementById('finalScore').innerText = Math.floor(this.score);
                    setTimeout(() => { this.deathOverlay.style.display = 'flex'; }, 400);
                }

                if (obs.x + obs.width < 0) {
                    this.obstacles.splice(index, 1);
                    this.score += 10;
                    this.scoreElement.innerText = Math.floor(this.score);
                    this.currentLevelSpeed += 0.05; 
                }
            });
        }

        this.player.draw(this.ctx);
        this.obstacles.forEach(o => o.draw(this.ctx));

        this.ctx.restore();
        requestAnimationFrame(() => this.gameLoop());
    }

    // UPDATED: Strict collision for the flying objects
    checkCollision(p, o) {
        // Reduced padding to 2 pixels for strictness
        const pad = 2;
        return p.x + pad < o.x + o.width &&
               p.x + p.width - pad > o.x &&
               p.y + pad < o.y + o.height &&
               p.y + p.height - pad > o.y;
    }

    restart() { this.resetGameVariables(); }
    backToMenu() { location.reload(); }
}

const game = new GameEngine();
function startGame(speed) { game.start(speed); }