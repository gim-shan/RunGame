class PowerUp {
    constructor(canvasWidth, canvasHeight, speed) {
        this.type = Math.random() > 0.5 ? "INVINCIBLE" : "SPEED";
        this.width = 30;
        this.height = 30;
        this.x = canvasWidth;
        
        // --- HEIGHT FIX ---
        // Moved from -140 to -200. 
        // This puts it high enough that the "magnetic hitbox" won't touch 
        // a player running on the ground, forcing them to jump for it.
        this.y = canvasHeight - 200;
        
        this.speed = speed;
        this.color = this.type === "INVINCIBLE" ? "#00ff88" : "#ff3300"; // Green or Cyan
        this.angle = 0; 
    }

    draw(ctx) {
        this.angle += 0.1;
        let bobbing = Math.sin(this.angle) * 5;
        
        ctx.save();
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        ctx.fillStyle = this.color;
        
        // Draw a floating diamond shape
        ctx.translate(this.x + this.width/2, this.y + this.height/2 + bobbing);
        ctx.rotate(Math.PI / 4);
        ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
        
        ctx.restore();
    }

    update() {
        this.x -= this.speed;
    }
}