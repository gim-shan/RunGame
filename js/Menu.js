class Menu {
    constructor() {
        this.overlay = document.getElementById('menu-overlay');
        this.levelDisplay = document.getElementById('currentLevel');
    }

    selectLevel(level) {
        let speed;
        let levelName;

        switch(level) {
            case 1: speed = 4; levelName = "Beginner"; break;
            case 2: speed = 7; levelName = "Intermediate"; break;
            case 3: speed = 11; levelName = "Hardcore"; break;
        }

        this.overlay.style.display = 'none'; // Hide menu
        this.levelDisplay.innerText = levelName;
        
        // Call the global start function in Game.js
        startGame(speed); 
    }
}

const menu = new Menu();