class GameEngine {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score');
        this.deathOverlay = document.getElementById('death-overlay');
        
        // High Score Elements
        this.highScoreDisplay = document.getElementById('highScoreDisplay');
        this.menuHighScore = document.getElementById('menuHighScore');
        
        this.resize();
        window.addEventListener('resize', () => this.resize());

        this.player = new Player(this.canvas.width, this.canvas.height);
        this.obstacles = [];
        this.powerups = [];
        this.stars = this.createStars();
        
        this.score = 0;
        this.gameActive = false;
        this.currentLevelSpeed = 0;
        this.initialLevelSpeed = 0;
        this.obstacleTimer = 0;
        this.nextSpawnAt = 120;
        this.shakeDuration = 0;
        this.powerUpTimer = 0;
        this.levelUpTextTimer = 0;

        // LOAD HIGH SCORE FROM BROWSER MEMORY
        // If it doesn't exist yet, default to 0
        this.highScore = localStorage.getItem('cyberHighScore') || 0;
        this.highScoreDisplay.innerText = this.highScore;
        if (this.menuHighScore) this.menuHighScore.innerText = this.highScore;

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
        for(let i=0; i<150; i++) s.push({ x: Math.random()*this.canvas.width, y: Math.random()*this.canvas.height, size: Math.random()*2.5 });
        return s;
    }

    drawProgressBar() {
        const width = 200;
        const height = 10;
        const x = this.canvas.width / 2 - width / 2;
        const y = 40;
        
        let progress = (this.currentLevelSpeed - this.initialLevelSpeed) / 10;
        if (progress >= 1) {
            progress = 1;
            if (this.levelUpTextTimer <= 0) this.levelUpTextTimer = 100;
        }

        this.ctx.fillStyle = "white";
        this.ctx.font = "12px Orbitron";
        this.ctx.textAlign = "center";
        this.ctx.fillText("SPEED PROTOCOL", this.canvas.width / 2, y - 10);

        this.ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
        this.ctx.fillRect(x, y, width, height);
        
        this.ctx.fillStyle = "#00d2ff";
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = "#00d2ff";
        this.ctx.fillRect(x, y, width * progress, height);
        this.ctx.shadowBlur = 0;
    }

    drawBackground() {
        this.ctx.fillStyle = "white";
        this.stars.forEach(s => {
            this.ctx.fillRect(s.x, s.y, s.size, s.size);
            if(this.gameActive) s.x -= (this.player.currentStatus === "SPEED" ? 5 : 0.5);
            if(s.x < 0) s.x = this.canvas.width;
        });

        const floorY = this.canvas.height - 50;
        this.ctx.strokeStyle = "#4834d4";
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(0, floorY);
        this.ctx.lineTo(this.canvas.width, floorY);
        this.ctx.stroke();
        
        this.ctx.fillStyle = "rgba(72, 52, 212, 0.15)";
        this.ctx.fillRect(0, floorY, this.canvas.width, 50);
    }

    start(speed) { 
        this.initialLevelSpeed = speed; 
        this.resetGameVariables(); 
        this.gameLoop(); 
    }

    resetGameVariables() {
        this.score = 0;
        this.obstacles = [];
        this.powerups = [];
        this.gameActive = true;
        this.currentLevelSpeed = this.initialLevelSpeed;
        this.player = new Player(this.canvas.width, this.canvas.height);
        this.deathOverlay.style.display = 'none';
        this.powerUpTimer = 0;
        this.levelUpTextTimer = 0;
        this.scoreElement.innerText = "0";
    }

    gameLoop() {
        this.ctx.save();
        if (this.shakeDuration > 0) {
            this.ctx.translate((Math.random() - 0.5) * 15, (Math.random() - 0.5) * 15);
            this.shakeDuration--;
        }

        this.ctx.fillStyle = "#0a0a19";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawBackground();

        if (this.gameActive) {
            if (this.keys['ArrowUp'] || this.keys['Space']) this.player.jump();
            if (this.keys['ArrowDown']) this.player.crouch(true); else this.player.crouch(false);
            if (this.keys['ArrowRight']) this.player.moveRight();
            if (this.keys['ArrowLeft']) this.player.moveLeft();

            this.player.update(this.canvas.width, this.canvas.height);

            if (this.powerUpTimer > 0) {
                this.powerUpTimer--;
            } else {
                this.player.currentStatus = "NORMAL";
            }

            this.obstacleTimer++;
            if (this.obstacleTimer >= this.nextSpawnAt) {
                if (Math.random() > 0.15) {
                    this.obstacles.push(new Obstacle(this.canvas.width, this.canvas.height, this.currentLevelSpeed));
                } else {
                    this.powerups.push(new PowerUp(this.canvas.width, this.canvas.height, this.currentLevelSpeed));
                }
                this.obstacleTimer = 0;
                this.nextSpawnAt = (this.player.currentStatus === "SPEED" ? 40 : 100) + (Math.random() * 150);
            }

            this.obstacles.forEach((obs, index) => {
                let speedMult = this.player.currentStatus === "SPEED" ? 2.5 : 1;
                obs.x -= (this.currentLevelSpeed * speedMult);
                obs.draw(this.ctx);

                if (this.player.currentStatus === "NORMAL") {
                    if (this.checkCollision(this.player, obs)) {
                        this.shakeDuration = 20;
                        this.gameOver(); // Call new gameOver function
                    }
                }

                if (obs.x + obs.width < 0) {
                    this.obstacles.splice(index, 1);
                    this.score += 10;
                    this.scoreElement.innerText = Math.floor(this.score);
                    this.currentLevelSpeed += 0.04;
                }
            });

            this.powerups.forEach((p, index) => {
                p.x -= this.currentLevelSpeed;
                p.draw(this.ctx);
                if (this.checkCollision(this.player, p)) {
                    this.player.currentStatus = p.type;
                    this.powerUpTimer = 300; 
                    this.powerups.splice(index, 1);
                }
            });
        }

        this.player.draw(this.ctx);
        this.drawProgressBar();

        if (this.levelUpTextTimer > 0) {
            this.ctx.fillStyle = `rgba(0, 210, 255, ${this.levelUpTextTimer / 100})`;
            this.ctx.font = "40px Orbitron";
            this.ctx.textAlign = "center";
            this.ctx.fillText("MAX SPEED REACHED", this.canvas.width / 2, this.canvas.height / 2);
            this.levelUpTextTimer--;
        }

        this.ctx.restore();
        requestAnimationFrame(() => this.gameLoop());
    }

    checkCollision(p, o) {
        const pad = 6;
        return p.x + pad < o.x + o.width && p.x + p.width - pad > o.x && p.y + pad < o.y + o.height && p.y + p.height - pad > o.y;
    }

    // NEW GAME OVER LOGIC FOR HIGH SCORES
    gameOver() {
        this.gameActive = false;
        let finalScore = Math.floor(this.score);
        document.getElementById('finalScore').innerText = finalScore;

        // Save High Score if beaten
        if (finalScore > this.highScore) {
            this.highScore = finalScore;
            localStorage.setItem('cyberHighScore', this.highScore);
            this.highScoreDisplay.innerText = this.highScore;
            
            // Optional: Change the game over text to celebrate!
            document.querySelector('#death-overlay h1').innerText = "NEW HIGH SCORE!";
            document.querySelector('#death-overlay h1').style.color = "#00ff88";
        } else {
            // Reset it back just in case they got a high score last round
            document.querySelector('#death-overlay h1').innerText = "CONNECTION LOST";
            document.querySelector('#death-overlay h1').style.color = "white";
        }

        setTimeout(() => { this.deathOverlay.style.display = 'flex'; }, 400);
    }

    restart() { this.resetGameVariables(); }
    backToMenu() { location.reload(); }
}

const game = new GameEngine();
function startGame(speed) { game.start(speed); }