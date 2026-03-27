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
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.isCrouching ? "#ff0080" : this.color;
        ctx.fillStyle = this.isCrouching ? "#ff0080" : this.color;
        
        this.roundRect(ctx, this.x, this.y, this.width, this.height, 5);
        
        // Thrusters
        ctx.fillStyle = "#fff";
        ctx.fillRect(this.x - 5, this.y + this.height/2 - 5, 5, 10);
        ctx.fillRect(this.x + this.width, this.y + this.height/2 - 5, 5, 10);
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
            this.height = this.baseHeight / 2;
            this.y += this.baseHeight / 2; // Shift down to stay on floor
        } else if (!active && this.isCrouching) {
            this.isCrouching = false;
            this.y -= this.baseHeight / 2; // Shift up to normal
            this.height = this.baseHeight;
        }
    }

    moveRight() { this.vx += this.acceleration; }
    moveLeft() { this.vx -= this.acceleration; }

    update(canvasWidth, canvasHeight) {
        this.y += this.dy;
        this.dy += this.gravity;
        this.x += this.vx;
        this.vx *= this.friction;

        const floorY = canvasHeight - this.height - this.floorOffset;

        if (this.y >= floorY) {
            this.y = floorY;
            this.dy = 0;
            this.isGrounded = true;
        }

        if (this.x < 20) this.x = 20;
        if (this.x + this.width > canvasWidth * 0.6) this.x = canvasWidth * 0.6 - this.width;
    }
}