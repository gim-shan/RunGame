class Obstacle {
    constructor(canvasWidth, canvasHeight, speed) {
        this.width = 25 + Math.random() * 25;
        this.height = 40 + Math.random() * 40;
        this.x = canvasWidth;
        this.y = canvasHeight - this.height - 20; // Align with floor
        this.speed = speed;
        this.color = "#9d50bb"; // Purple Neon
    }

    draw(ctx) {
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        
        // Gradient fill
        let gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
        gradient.addColorStop(0, "#9d50bb");
        gradient.addColorStop(1, "#6e48aa");
        
        ctx.fillStyle = gradient;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Neon cap
        ctx.fillStyle = "#ff0080";
        ctx.fillRect(this.x, this.y, this.width, 4);
        
        ctx.shadowBlur = 0;
    }

    update() {
        this.x -= this.speed;
    }
}