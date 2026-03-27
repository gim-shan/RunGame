class Obstacle {
    constructor(canvasWidth, canvasHeight, speed) {
        this.type = Math.random() > 0.4 ? "ground" : "flying";
        this.speed = speed;
        this.x = canvasWidth;

        if (this.type === "ground") {
            this.width = 30 + Math.random() * 30;
            this.height = 40 + Math.random() * 40;
            this.y = canvasHeight - this.height - 50;
            this.color = "#9d50bb";
        } else {
            this.width = 70;
            this.height = 20;
            // High enough that you MUST crouch to pass
            this.y = canvasHeight - 115; 
            this.color = "#f1c40f";
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        ctx.fillStyle = this.color;
        
        if (this.type === "flying") {
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.fillStyle = "#fff";
            ctx.fillRect(this.x, this.y + this.height/2 - 2, this.width, 4);
        } else {
            let g = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
            g.addColorStop(0, this.color);
            g.addColorStop(1, "#6e48aa");
            ctx.fillStyle = g;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
        ctx.restore();
    }

    update() {
        this.x -= this.speed;
    }
}