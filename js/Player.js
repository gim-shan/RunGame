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
        this.maxHistory = 6;
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

    draw(ctx) {
        ctx.save();
        
        // Ghost Trail
        this.history.forEach((pos, index) => {
            let opacity = (index + 1) / (this.history.length * 2);
            ctx.globalAlpha = opacity;
            ctx.fillStyle = this.isCrouching ? "#ff0080" : this.color;
            this.roundRect(ctx, pos.x, pos.y, this.width, pos.h, 5);
        });

        // Main Player
        ctx.globalAlpha = 1.0;
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.isCrouching ? "#ff0080" : this.color;
        ctx.fillStyle = this.isCrouching ? "#ff0080" : this.color;
        
        this.roundRect(ctx, this.x, this.y, this.width, this.height, 5);
        
        // Detail / Eye
        ctx.fillStyle = "#fff";
        ctx.fillRect(this.x + this.width - 12, this.y + 10, 6, 6);
        
        ctx.restore();
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
            this.height = this.baseHeight / 2; // Hitbox shrinks
            // No need to manually shift Y here, the update() ground check handles it
        } else if (!active && this.isCrouching) {
            this.isCrouching = false;
            this.height = this.baseHeight; // Hitbox grows back
            this.y -= this.baseHeight / 2; // Pop back up so we don't fall through floor
        }
    }

    moveRight() { this.vx += this.acceleration; }
    moveLeft() { this.vx -= this.acceleration; }

    update(canvasWidth, canvasHeight) {
        this.history.push({ x: this.x, y: this.y, h: this.height });
        if (this.history.length > this.maxHistory) this.history.shift();

        this.y += this.dy;
        this.dy += this.gravity;
        this.x += this.vx;
        this.vx *= this.friction;

        const floorLimit = canvasHeight - this.height - this.floorOffset;

        if (this.y >= floorLimit) {
            this.y = floorLimit;
            this.dy = 0;
            this.isGrounded = true;
        }

        if (this.x < 20) this.x = 20;
        if (this.x + this.width > canvasWidth * 0.6) this.x = canvasWidth * 0.6 - this.width;
    }
}