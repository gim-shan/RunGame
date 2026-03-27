class Obstacle {
    constructor(canvasWidth, canvasHeight, speed) {
        this.type = Math.random() > 0.4 ? "ground" : "flying";
        this.speed = speed;
        this.x = canvasWidth;

        if (this.type === "ground") {
            this.width = 30 + Math.random() * 30;
            this.height = 40 + Math.random() * 40;
            this.y = canvasHeight - this.height - 50; // On the floor
            this.color = "#9d50bb"; // Purple
        } else {
            this.width = 90; // Longer so you have to stay down longer
            this.height = 20;
            
            // CALIBRATION:
            // This is now significantly lower. 
            // It will pass through the middle of the player's standing body.
            this.y = canvasHeight - 95; 
            
            this.color = "#f1c40f"; // Gold/Yellow
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