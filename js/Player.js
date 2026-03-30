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
        this.jumpForce = 14; // Slightly lower base jump to accommodate double jump
        this.gravity = 0.7;
        this.vx = 0;
        this.acceleration = 0.8;
        this.friction = 0.92;
        
        this.isGrounded = false;
        this.isCrouching = false;
        this.history = [];
        
        // --- NEW: NINJA MOVEMENT VARS ---
        this.jumpCount = 0;
        this.maxJumps = 2; // Allow double jump
        
        this.isDashing = false;
        this.dashDuration = 0;
        this.dashCooldown = 0;
        
        this.currentStatus = "NORMAL"; 
    }

    draw(ctx) {
        ctx.save();
        let drawColor = this.color;
        if (this.currentStatus === "INVINCIBLE") drawColor = "#00ff88";
        if (this.currentStatus === "SPEED") drawColor = "#ff3300";
        if (this.isCrouching && this.currentStatus === "NORMAL") drawColor = "#ff0080";
        
        // If dashing, turn blinding white
        if (this.isDashing) drawColor = "#ffffff";

        this.history.forEach((pos, index) => {
            let opacity = (index + 1) / (this.history.length * 4);
            ctx.globalAlpha = (this.currentStatus === "INVINCIBLE" || this.isDashing) ? opacity * 0.5 : opacity;
            ctx.fillStyle = drawColor;
            this.roundRect(ctx, pos.x, pos.y, this.width, pos.h, 5);
        });

        ctx.globalAlpha = (this.currentStatus === "INVINCIBLE" && !this.isDashing) ? 0.5 : 1.0;
        ctx.shadowBlur = this.isDashing ? 30 : 20; // Bigger glow when dashing
        ctx.shadowColor = drawColor;
        ctx.fillStyle = drawColor;
        this.roundRect(ctx, this.x, this.y, this.width, this.height, 5);

        ctx.fillStyle = "white";
        ctx.shadowBlur = 5;
        ctx.fillRect(this.x + this.width - 15, this.y + 10, 7, 7);

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
        // Can jump if grounded OR if we haven't used our double jump yet
        if (this.jumpCount < this.maxJumps && !this.isCrouching) { 
            this.dy = -this.jumpForce; 
            this.isGrounded = false; 
            this.jumpCount++; // Increment jump tracker
        } 
    }

    dash() {
        if (this.dashCooldown <= 0 && !this.isCrouching) {
            this.isDashing = true;
            this.dashDuration = 20; // Lasts 1/3rd of a second
            this.dashCooldown = 600; // 5-second cooldown at 60fps
            this.vx = 20; // Blast forward
            
            // Suspend gravity briefly while dashing in the air
            this.dy = 0; 
        }
    }

    crouch(active) {
        if (active && !this.isCrouching) {
            this.isCrouching = true;
            this.y += (this.baseHeight / 2); 
            this.height = this.baseHeight / 2;
            this.dy += 5; // Slam down fast if crouching in mid-air
        } else if (!active && this.isCrouching) {
            this.isCrouching = false;
            this.height = this.baseHeight;
            this.y -= (this.baseHeight / 2); 
        }
    }

    moveRight() { this.vx += this.acceleration; }
    moveLeft() { this.vx -= this.acceleration; }

    update(canvasWidth, canvasHeight) {
        // Record trail history
        this.history.push({ x: this.x, y: this.y, h: this.height });
        if (this.history.length > (this.isDashing ? 15 : 10)) this.history.shift();

        // Dash Timers
        if (this.dashDuration > 0) {
            this.dashDuration--;
            if (this.dashDuration <= 0) this.isDashing = false;
        }
        if (this.dashCooldown > 0) {
            this.dashCooldown--;
        }

        this.y += this.dy;
        // Don't apply gravity if currently dashing
        if (!this.isDashing) this.dy += this.gravity; 
        
        this.x += this.vx;
        this.vx *= this.friction;

        const floorLimit = canvasHeight - this.height - this.floorOffset;
        if (this.y >= floorLimit) { 
            this.y = floorLimit; 
            this.dy = 0; 
            this.isGrounded = true; 
            this.jumpCount = 0; // Reset double jumps when hitting the ground
        } else {
            this.isGrounded = false;
        }

        if (this.x < 20) this.x = 20;
        if (this.x + this.width > canvasWidth * 0.7) this.x = canvasWidth * 0.7 - this.width;
    }
}