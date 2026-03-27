class Player {
    constructor(canvasWidth, canvasHeight) {
        this.baseHeight = 45;
        this.width = 45;
        this.height = this.baseHeight;
        this.x = 100;
        this.floorOffset = 50;
        this.y = canvasHeight - this.height - this.floorOffset;
        
        this.color = "#00d2ff";
        this.dy = 0;
        this.jumpForce = 15;
        this.gravity = 0.7;
        this.vx = 0;
        this.acceleration = 0.8;
        this.friction = 0.92;
        
        this.isGrounded = false;
        this.isCrouching = false;
        this.history = [];
        this.maxHistory = 8;
        this.currentStatus = "NORMAL"; 
    }

    draw(ctx) {
        ctx.save();
        let drawColor = this.color;
        if (this.currentStatus === "INVINCIBLE") drawColor = "#00ff88";
        if (this.currentStatus === "SPEED") drawColor = "#ff3300";
        if (this.isCrouching && this.currentStatus === "NORMAL") drawColor = "#ff0080";

        // Draw Ghost Trail
        this.history.forEach((pos, index) => {
            let opacity = (index + 1) / (this.history.length * 4);
            ctx.globalAlpha = (this.currentStatus === "INVINCIBLE") ? opacity * 0.3 : opacity;
            ctx.fillStyle = drawColor;
            this.roundRect(ctx, pos.x, pos.y, this.width, pos.h, 5);
        });

        // Draw Main Body
        ctx.globalAlpha = (this.currentStatus === "INVINCIBLE") ? 0.5 : 1.0;
        ctx.shadowBlur = 20;
        ctx.shadowColor = drawColor;
        ctx.fillStyle = drawColor;
        this.roundRect(ctx, this.x, this.y, this.width, this.height, 5);

        // --- NEW BOX DESIGNS ---
        // 1. Neon Eye
        ctx.fillStyle = "white";
        ctx.shadowBlur = 5;
        ctx.fillRect(this.x + this.width - 15, this.y + 10, 7, 7);

        // 2. Thrusters (bottom sides)
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.fillRect(this.x - 5, this.y + this.height - 15, 5, 10);
        ctx.fillRect(this.x + this.width, this.y + this.height - 15, 5, 10);

        ctx.restore();
    }

    roundRect(ctx, x, y, width, height, radius) {
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

    jump() { 
        if (this.isGrounded && !this.isCrouching) { 
            this.dy = -this.jumpForce; 
            this.isGrounded = false; 
        } 
    }

    crouch(active) {
        if (active && !this.isCrouching) {
            this.isCrouching = true;
            this.y += (this.baseHeight / 2); 
            this.height = this.baseHeight / 2;
        } else if (!active && this.isCrouching) {
            this.isCrouching = false;
            this.height = this.baseHeight;
            this.y -= (this.baseHeight / 2); 
        }
    }

    moveRight() { this.vx += this.acceleration; }
    moveLeft() { this.vx -= this.acceleration; }

    update(canvasWidth, canvasHeight) {
        this.history.push({ x: this.x, y: this.y, h: this.height });
        if (this.history.length > 10) this.history.shift();

        this.y += this.dy;
        this.dy += this.gravity;
        this.x += this.vx;
        this.vx *= this.friction;

        const floorLimit = canvasHeight - this.height - this.floorOffset;
        if (this.y >= floorLimit) { 
            this.y = floorLimit; 
            this.dy = 0; 
            this.isGrounded = true; 
        } else {
            this.isGrounded = false;
        }

        if (this.x < 20) this.x = 20;
        if (this.x + this.width > canvasWidth * 0.6) this.x = canvasWidth * 0.6 - this.width;
    }
}