class Player {
    constructor(canvasWidth, canvasHeight) {
        this.width = 45; // Slightly larger for better visibility on big screens
        this.height = 45;
        this.x = 100;
        this.floorOffset = 50; // Matches the floor line in Game.js
        this.y = canvasHeight - this.height - this.floorOffset;
        
        this.color = "#00d2ff";
        this.dy = 0;
        this.jumpForce = 15; // Increased for larger screen height
        this.gravity = 0.7;  // Increased for "weighty" feel
        
        this.vx = 0;
        this.acceleration = 0.8;
        this.friction = 0.92;
        this.maxForwardSpeed = 9;
        this.minBackSpeed = -4;
        this.isGrounded = false;
    }

    draw(ctx) {
        ctx.save();
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.color;
        
        // Body with Gradient
        let g = ctx.createLinearGradient(this.x, this.y, this.x + this.width, this.y + this.height);
        g.addColorStop(0, "#00d2ff");
        g.addColorStop(1, "#3a86ff");
        
        ctx.fillStyle = g;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Neon Eye
        ctx.fillStyle = "#fff";
        ctx.shadowBlur = 5;
        ctx.fillRect(this.x + this.width - 12, this.y + 10, 6, 6);
        
        ctx.restore();
    }

    jump() {
        if (this.isGrounded) {
            this.dy = -this.jumpForce;
            this.isGrounded = false;
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

        if (this.y > floorY) {
            this.y = floorY;
            this.dy = 0;
            this.isGrounded = true;
        }

        // Keep player on screen
        if (this.x < 20) this.x = 20;
        if (this.x + this.width > canvasWidth * 0.6) this.x = canvasWidth * 0.6 - this.width;
    }
}