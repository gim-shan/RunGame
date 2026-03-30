class Obstacle {
    constructor(canvasWidth, canvasHeight, speed) {
        this.type = Math.random() > 0.4 ? "ground" : "flying";
        this.speed = speed;
        this.x = canvasWidth;
        
        // Added a simple time variable for pulsing animation effects
        this.time = Math.random() * 100;

        if (this.type === "ground") {
            this.width = 30 + Math.random() * 30;
            this.height = 40 + Math.random() * 40;
            this.y = canvasHeight - this.height - 50; // On the floor
            
            // --- CLASSIC COLOR: Purple ---
            this.color = "#9d50bb"; 
        } else {
            this.width = 90; 
            this.height = 20;
            this.y = canvasHeight - 95; // Head height
            
            // --- CLASSIC COLOR: Yellow/Gold ---
            this.color = "#f1c40f"; 
        }
    }

    draw(ctx) {
        // Update animation timer to create a smooth pulse between 0 and 1
        this.time += 0.1;
        let pulse = (Math.sin(this.time) + 1) / 2;

        ctx.save();
        
        if (this.type === "flying") {
            // --- ENHANCED FLYING OBSTACLE (Laser Gate) ---
            
            // 1. Outer Glow
            ctx.shadowBlur = 15 + (pulse * 10); // Glow pulses in and out
            ctx.shadowColor = this.color;
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            
            // 2. Bright White Energy Core
            ctx.shadowBlur = 0; // Turn off shadow for crisp inner details
            ctx.fillStyle = `rgba(255, 255, 255, ${0.7 + pulse * 0.3})`; // Flickering white
            ctx.fillRect(this.x, this.y + this.height/2 - 2, this.width, 4);

            // 3. Metallic End-Caps (Makes it look like a physical device emitting the laser)
            ctx.fillStyle = "#fff";
            // Left cap
            ctx.fillRect(this.x - 4, this.y - 2, 8, this.height + 4);
            // Right cap
            ctx.fillRect(this.x + this.width - 4, this.y - 2, 8, this.height + 4);

        } else {
            // --- ENHANCED GROUND OBSTACLE (Neon Pylon) ---
            
            // 1. Base Gradient (Darker at the bottom to blend with the floor)
            let g = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
            g.addColorStop(0, this.color);
            g.addColorStop(1, "#1a0b2e"); 
            ctx.fillStyle = g;
            
            ctx.shadowBlur = 15;
            ctx.shadowColor = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);

            // 2. Glowing Outer Border
            ctx.shadowBlur = 0;
            // Uses the rgb values of the purple color for the glowing border
            ctx.strokeStyle = `rgba(157, 80, 187, ${0.5 + pulse * 0.5})`; 
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x, this.y, this.width, this.height);

            // 3. Inner Tech Accents
            ctx.fillStyle = `rgba(255, 255, 255, ${0.2 + pulse * 0.2})`;
            // Vertical center line
            ctx.fillRect(this.x + this.width / 2 - 1, this.y + 5, 2, this.height - 10);
            // Horizontal top accent
            ctx.fillRect(this.x + 5, this.y + 8, this.width - 10, 2);
        }
        
        ctx.restore();
    }

    update() {
        this.x -= this.speed;
    }
}