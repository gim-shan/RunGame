class Menu {
    constructor() {
        this.overlay = document.getElementById('menu-overlay');
        this.levelDisplay = document.getElementById('currentLevel');
    }

    selectLevel(level) {
        let speed;
        let levelName;

        switch(level) {
            case 1: speed = 5; levelName = "Beginner"; break;
            case 2: speed = 8; levelName = "Intermediate"; break;
            case 3: speed = 12; levelName = "Hardcore"; break;
        }

        this.overlay.style.display = 'none';
        this.levelDisplay.innerText = levelName;
        startGame(speed); 
    }
}
const menu = new Menu();