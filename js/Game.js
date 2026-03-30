class GameEngine {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score');
        this.deathOverlay = document.getElementById('death-overlay');
        
        this.highScoreDisplay = document.getElementById('highScoreDisplay');
        this.menuHighScore = document.getElementById('menuHighScore');
        
        // Initialize retro Audio Engine
        this.audio = new AudioEngine();
        
        this.resize();
        window.addEventListener('resize', () => this.resize());

        this.player = new Player(this.canvas.width, this.canvas.height);
        this.obstacles = [];
        this.powerups = [];
        this.stars = this.createStars();
        this.particles = [];
        
        this.score = 0;
        this.gameActive = false;
        this.playerDead = false;
        this.currentLevelSpeed = 0;
        this.initialLevelSpeed = 0;
        this.obstacleTimer = 0;
        this.nextSpawnAt = 80;
        this.shakeDuration = 0;
        this.powerUpTimer = 0;
        this.levelUpTextTimer = 0;
        
        // Input tracking
        this.jumpKeyPressed = false;
        this.dashKeyPressed = false;

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
        for(let i=0; i<150; i++) {
            s.push({ x: Math.random() * 2000, y: Math.random() * 1000, size: Math.random() * 2.5 });
        }
        return s;
    }

    createExplosion(x, y, color) {
        for(let i=0; i<30; i++) {
            this.particles.push({
                x: x + 22, y: y + 22,
                vx: (Math.random() - 0.5) * 20, vy: (Math.random() - 1) * 15,   
                size: Math.random() * 8 + 4, color: color, alpha: 1,
                rotation: Math.random() * Math.PI * 2, rotSpeed: (Math.random() - 0.5) * 0.5
            });
        }
    }

    drawUI() {
        const width = 200;
        const height = 10;
        const x = this.canvas.width / 2 - width / 2;
        const y = 40;
        
        // --- SPEED BAR ---
        let progress = (this.currentLevelSpeed - this.initialLevelSpeed) / 10;
        if (progress >= 1) { progress = 1; if (this.levelUpTextTimer <= 0) this.levelUpTextTimer = 100; }

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

        // --- DASH COOLDOWN BAR (Set to 600 frames / 10 seconds) ---
        const dashY = y + 25;
        this.ctx.fillStyle = "white";
        this.ctx.fillText("GLITCH DASH (SHIFT)", this.canvas.width / 2, dashY - 5);
        this.ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
        this.ctx.fillRect(x, dashY, width, 5);

        let dashReady = 1 - (this.player.dashCooldown / 600);
        this.ctx.fillStyle = dashReady === 1 ? "#ffffff" : "#ff0080";
        this.ctx.shadowBlur = dashReady === 1 ? 10 : 0;
        this.ctx.shadowColor = "#ffffff";
        this.ctx.fillRect(x, dashY, width * dashReady, 5);
        this.ctx.shadowBlur = 0;
    }

    drawBackground() {
        this.ctx.fillStyle = "#0a0a19";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = "white";
        this.stars.forEach(s => {
            let stretch = (this.gameActive && (this.player.currentStatus === "SPEED" || this.player.isDashing)) ? 4 : 1;
            this.ctx.fillRect(s.x, s.y, s.size * stretch, s.size);
            
            let starMove = (this.gameActive && (this.player.currentStatus === "SPEED" || this.player.isDashing)) ? 5 : 0.5;
            if (this.gameActive) s.x -= starMove;
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
        this.audio.init();
        this.audio.startMusic();
        this.resetGameVariables(); 
        this.gameLoop(); 
    }

    resetGameVariables() {
        this.score = 0;
        this.obstacles = [];
        this.powerups = [];
        this.particles = [];
        this.gameActive = true;
        this.playerDead = false;
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
            this.ctx.translate((Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20); 
            this.shakeDuration--;
        }

        this.drawBackground();

        if (this.gameActive) {
            // Jump Logic
            if (this.keys['ArrowUp'] || this.keys['Space'] || this.keys['KeyW']) {
                if (!this.jumpKeyPressed && this.player.jumpCount < this.player.maxJumps && !this.player.isCrouching) {
                    this.audio.playJump();
                    this.player.jump();
                    this.jumpKeyPressed = true;
                }
            } else {
                this.jumpKeyPressed = false;
            }

            // Dash Logic
            if (this.keys['ShiftLeft'] || this.keys['ShiftRight']) {
                if (!this.dashKeyPressed && this.player.dashCooldown <= 0 && !this.player.isCrouching) {
                    this.audio.playDash();
                    this.player.dash();
                    this.dashKeyPressed = true;
                }
            } else {
                this.dashKeyPressed = false;
            }

            if (this.keys['ArrowDown'] || this.keys['KeyS']) this.player.crouch(true); else this.player.crouch(false);
            if (this.keys['ArrowRight'] || this.keys['KeyD']) this.player.moveRight();
            if (this.keys['ArrowLeft'] || this.keys['KeyA']) this.player.moveLeft();

            this.player.update(this.canvas.width, this.canvas.height);

            if (this.powerUpTimer > 0) {
                this.powerUpTimer--;
            } else {
                this.player.currentStatus = "NORMAL";
            }

            this.obstacleTimer++;
            if (this.obstacleTimer >= this.nextSpawnAt) {
                if (Math.random() > 0.10) {
                    this.obstacles.push(new Obstacle(this.canvas.width, this.canvas.height, this.currentLevelSpeed));
                } else {
                    this.powerups.push(new PowerUp(this.canvas.width, this.canvas.height, this.currentLevelSpeed));
                }
                
                this.obstacleTimer = 0;
                let baseGap = this.player.currentStatus === "SPEED" ? 25 : 55;
                let gapType = Math.random();

                if (gapType > 0.85) { this.nextSpawnAt = baseGap + 100 + (Math.random() * 60); } 
                else if (gapType > 0.45) { this.nextSpawnAt = baseGap + 40 + (Math.random() * 40); } 
                else { this.nextSpawnAt = baseGap + (Math.random() * 15); }
            }

            this.obstacles.forEach((obs, index) => {
                let speedMult = (this.player.currentStatus === "SPEED" || this.player.isDashing) ? 2.5 : 1;
                obs.x -= (this.currentLevelSpeed * speedMult);
                obs.draw(this.ctx);

                // --- UPDATED COLLISION LOGIC ---
                if (this.checkCollision(this.player, obs, false)) { 
                    
                    // 1. DASH: Only action that destroys obstacles
                    if (this.player.isDashing) {
                        this.shakeDuration = 10;
                        this.createExplosion(obs.x, obs.y, obs.color);
                        this.audio.playBreak(); 
                        this.obstacles.splice(index, 1);
                        this.score += 50; 
                        this.scoreElement.innerText = Math.floor(this.score);
                    } 
                    // 2. POWERUPS: Pass through harmlessly like a ghost
                    else if (this.player.currentStatus === "INVINCIBLE" || this.player.currentStatus === "SPEED") {
                        // Safe passage
                    } 
                    // 3. NORMAL: Connection Lost
                    else {
                        this.shakeDuration = 25; 
                        let pColor = this.player.isCrouching ? "#ff0080" : "#00d2ff";
                        this.createExplosion(this.player.x, this.player.y, pColor);
                        this.playerDead = true;
                        this.gameOver();
                    }
                }

                if (obs && obs.x + obs.width < 0) {
                    this.obstacles.splice(index, 1);
                    this.score += 10;
                    this.scoreElement.innerText = Math.floor(this.score);
                    this.currentLevelSpeed += 0.04;
                }
            });

            this.powerups.forEach((p, index) => {
                p.x -= this.currentLevelSpeed;
                p.draw(this.ctx);
                
                if (this.checkCollision(this.player, p, true)) { 
                    this.audio.playPowerUp(); 
                    this.player.currentStatus = p.type;
                    this.powerUpTimer = 600; 
                    this.powerups.splice(index, 1);
                }
                else if (p.x + p.width < 0) {
                    this.powerups.splice(index, 1);
                }
            });
        } else {
            this.obstacles.forEach(obs => obs.draw(this.ctx));
            this.powerups.forEach(p => p.draw(this.ctx));
        }

        this.particles = this.particles.filter(p => {
            p.x += p.vx; p.y += p.vy; p.vy += 0.8; p.alpha -= 0.015; p.rotation += p.rotSpeed; 
            return p.alpha > 0;
        });

        this.particles.forEach(p => {
            this.ctx.save();
            this.ctx.globalAlpha = p.alpha;
            this.ctx.fillStyle = p.color;
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = p.color;
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate(p.rotation);
            this.ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
            this.ctx.restore();
        });

        if (!this.playerDead) {
            this.player.draw(this.ctx);
        }

        this.drawUI();

        if (this.levelUpTextTimer > 0) {
            this.ctx.fillStyle = `rgba(0, 210, 255, ${this.levelUpTextTimer / 100})`;
            this.ctx.font = "40px Orbitron";
            this.ctx.textAlign = "center";
            this.ctx.fillText("MAX SPEED REACHED", this.canvas.width / 2, this.canvas.height / 2);
            this.levelUpTextTimer--;
        }

        this.ctx.restore();
        if (this.gameActive || this.particles.length > 0) {
             requestAnimationFrame(() => this.gameLoop());
        }
    }

    checkCollision(p, o, isPowerUp = false) {
        const pad = isPowerUp ? -25 : 6;
        return p.x + pad < o.x + o.width && 
               p.x + p.width - pad > o.x && 
               p.y + pad < o.y + o.height && 
               p.y + p.height - pad > o.y;
    }

    gameOver() {
        this.gameActive = false;
        this.audio.stopMusic();
        this.audio.playCrash();

        let finalScore = Math.floor(this.score);
        document.getElementById('finalScore').innerText = finalScore;

        if (finalScore > this.highScore) {
            this.highScore = finalScore;
            localStorage.setItem('cyberHighScore', this.highScore);
            this.highScoreDisplay.innerText = this.highScore;
            document.querySelector('#death-overlay h1').innerText = "NEW HIGH SCORE!";
            document.querySelector('#death-overlay h1').style.color = "#00ff88";
        } else {
            document.querySelector('#death-overlay h1').innerText = "CONNECTION LOST";
            document.querySelector('#death-overlay h1').style.color = "white";
        }

        setTimeout(() => { this.deathOverlay.style.display = 'flex'; }, 800);
    }

    restart() { this.resetGameVariables(); this.gameLoop(); }
    backToMenu() { location.reload(); }
}

const game = new GameEngine();
function startGame(speed) { game.start(speed); }