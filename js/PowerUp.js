class PowerUp {
    constructor(canvasWidth, canvasHeight, speed) {
        this.type = Math.random() > 0.5 ? "INVINCIBLE" : "SPEED";
        this.width = 30;
        this.height = 30;
        this.x = canvasWidth;
        // Float at a reachable height
        this.y = canvasHeight - 120 - Math.random() * 50;
        this.speed = speed;
        this.color = this.type === "INVINCIBLE" ? "#00ff88" : "#ff3300";
        this.angle = 0; // For a floating bobbing effect
    }

    draw(ctx) {
        this.angle += 0.1;
        let bobbing = Math.sin(this.angle) * 5;
        
        ctx.save();
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        ctx.fillStyle = this.color;
        
        // Draw a diamond shape
        ctx.translate(this.x + this.width/2, this.y + this.height/2 + bobbing);
        ctx.rotate(Math.PI / 4);
        ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
        
        ctx.restore();
    }

    update() {
        this.x -= this.speed;
    }
}