// All code from the previous <script> block in index.html is now here.
let eggs = [];
const eggIcon = '🥚';
const eggSize = 32;

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

window.addEventListener('resize', resizeCanvas);

// Resize canvas to fill window
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    draw();
}

class FoodType {
    constructor(name, imgUrl) {
        this.name = name;
        this.imgUrl = imgUrl;
    }
}

const foodTypes = [
    new FoodType('meat', '🍖'),
    new FoodType('veggie', '🥦'),
    new FoodType('egg', '🥚'),
    new FoodType('shrimp', '🦐')
];

class DietType {
    constructor(name, foodTypes) {
        this.name = name;
        this.foodTypes = foodTypes;
    }

    accepts(food) {
        // Check if the food type is in this diet's food types
        return this.foodTypes.some(ft => ft.name === food.name);
    }
}

const dietTypes = [
    new DietType('Carnívoro', [foodTypes[0], foodTypes[2]]), // Meat, Egg
    new DietType('Herbívoro', [foodTypes[1]]), // Veggie
    new DietType('Carnívoro marino', [foodTypes[0], foodTypes[3]]),
    new DietType('Omnívoro', foodTypes) // All types
];

class Species {
    constructor(name, img, sound, diet) {
        this.name = name;
        this.img = new Image();
        this.img.src = img;
        this.sound = new Audio(sound);
        this.diet = diet;
    }

    growl() {
        this.sound.currentTime = 0; // Reset sound to start
        this.sound.play();
    }
}

const species = [
    new Species('Sauropod', 'images/sauropod.png', './sounds/sauropod.mp3', dietTypes[1]),
    new Species('T-Rex', 'images/trex.png', './sounds/t_rex.mp3', dietTypes[0]),
    new Species('Triceratops', 'images/triceratops.png', './sounds/triceratops.mp3', dietTypes[1]),
    new Species('Pterodactyl', 'images/pterodactyl.png', './sounds/pterodactyl.mp3', dietTypes[0]),
    new Species('Mosasaurus', 'images/mosasaurus.png', './sounds/mosasaurus.mp3', dietTypes[2]),
    new Species('Velociraptor', 'images/velociraptor.png', './sounds/velociraptor.mp3', dietTypes[0])
];

// Bone image for dead dinosaurs
const boneImg = new Image();
boneImg.src = 'images/bone.png';

// Dinosaur class: add a type property (0 = sauropod, 1 = trex)
class Dinosaur {
    constructor(x, y, type, species) {
        this.x = x;
        this.y = y;
        this.size = 100;
        this.selected = false;
        this.type = type; // 0 = sauropod, 1 = trex
        this.health = 100;
        this.hunger = 100;
        this.hygene = 100;
        this.facing = Math.random() < 0.5 ? 'left' : 'right';
        this.dead = false;
        this.deadSince = null;
        this.zeroStatsSince = null;
        this.species = species;
    }

    draw(ctx) {
        if (this.dead) {
            ctx.save();
            ctx.drawImage(boneImg, this.x, this.y, this.size, this.size);
            ctx.restore();
            return;
        }
        ctx.save();
        if (this.facing === 'left') {
            ctx.translate(this.x + this.size, this.y);
            ctx.scale(-1, 1);
            ctx.drawImage(this.species.img, 0, 0, this.size, this.size);
        } else {
            ctx.drawImage(this.species.img, this.x, this.y, this.size, this.size);
        }
        ctx.restore();
        // Show stat icons above dino if any stat is below 50
        const lowStats = [];
        if (this.health < 50) lowStats.push({icon: '❤', color: '#e53935'});
        if (this.hunger < 50) lowStats.push({icon: '🍽️', color: '#fbc02d'});
        if (this.hygene < 50) lowStats.push({icon: '🧼', color: '#039be5'});
        if (lowStats.length > 0) {
            ctx.save();
            ctx.font = '28px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.globalAlpha = 0.92;
            let totalWidth = 0;
            const iconWidths = lowStats.map(s => ctx.measureText(s.icon).width);
            totalWidth = iconWidths.reduce((a, b) => a + b, 0) + (lowStats.length - 1) * 8;
            let x = this.x + this.size / 2 - totalWidth / 2;
            for (let i = 0; i < lowStats.length; i++) {
                ctx.fillStyle = lowStats[i].color;
                ctx.fillText(lowStats[i].icon, x + iconWidths[i] / 2, this.y - 8);
                x += iconWidths[i] + 8;
            }
            ctx.restore();
        }
        // Draw stats bars below the dinosaur ONLY if selected
        if (this.selected) {
            const barWidth = this.size;
            const barHeight = 7;
            const spacing = 3;
            const iconSize = 10; // Match bar height
            const iconOffset = 4;
            const startY = this.y + this.size + 5;
            // Health (red)
            ctx.save();
            ctx.fillStyle = '#e53935';
            ctx.fillRect(
                this.x + iconSize + iconOffset,
                startY,
                (barWidth - iconSize - iconOffset) * (this.health / 100),
                barHeight
            );
            ctx.strokeStyle = '#b71c1c';
            ctx.strokeRect(this.x + iconSize + iconOffset, startY, barWidth - iconSize - iconOffset, barHeight);
            ctx.font = `bold ${iconSize}px sans-serif`;
            ctx.textBaseline = 'top';
            ctx.fillText('❤', this.x, startY - 1);
            ctx.restore();
            // Hunger (yellow)
            ctx.save();
            ctx.fillStyle = '#fbc02d';
            ctx.fillRect(
                this.x + iconSize + iconOffset,
                startY + barHeight + spacing,
                (barWidth - iconSize - iconOffset) * (this.hunger / 100),
                barHeight
            );
            ctx.strokeStyle = '#f57c00';
            ctx.strokeRect(this.x + iconSize + iconOffset, startY + barHeight + spacing, barWidth - iconSize - iconOffset, barHeight);
            ctx.font = `bold ${iconSize}px sans-serif`;
            ctx.textBaseline = 'top';
            ctx.fillText('🍽️', this.x, startY + barHeight + spacing - 1);
            ctx.restore();
            // Hygene (blue)
            ctx.save();
            ctx.fillStyle = '#039be5';
            ctx.fillRect(
                this.x + iconSize + iconOffset,
                startY + 2 * (barHeight + spacing),
                (barWidth - iconSize - iconOffset) * (this.hygene / 100),
                barHeight
            );
            ctx.strokeStyle = '#01579b';
            ctx.strokeRect(this.x + iconSize + iconOffset, startY + 2 * (barHeight + spacing), barWidth - iconSize - iconOffset, barHeight);
            ctx.font = `bold ${iconSize}px sans-serif`;
            ctx.textBaseline = 'top';
            ctx.fillText('🧼', this.x, startY + 2 * (barHeight + spacing) - 1);
            ctx.restore();
        }

    }

    isPointInside(px, py) {
        // Simple bounding box hit test
        return px >= this.x && px <= this.x + this.size &&
               py >= this.y && py <= this.y + this.size;
    }

    moveRandomly(canvasWidth, canvasHeight) {
        // Move by a small random delta, but stay within canvas bounds
        const dx = Math.floor(Math.random() * 11) - 5; // -5 to +5
        const dy = Math.floor(Math.random() * 11) - 5; // -5 to +5
        this.x = Math.max(0, Math.min(canvasWidth - this.size, this.x + dx));
        this.y = Math.max(0, Math.min(canvasHeight - this.size, this.y + dy));
    }

    growl() {
        this.species.growl();
    }

    eat(foodName) {
        // Check if the food type is in this dinosaur's diet
        const foodType = foodTypes.find(ft => ft.name === foodName);
        if (this.species.diet.accepts(foodType)) {
            // Increase hunger and return true
            this.hunger = 100;
            return true;
        }
        // Wrong food type for this dinosaur
        return false;
    }
}

let dinosaurs = [];

resizeCanvas();

let gameStarted = false;

// Background music
const bgMusic = new Audio('./sounds/music.mp3');
bgMusic.loop = true;
bgMusic.volume = 0.5; // Set a reasonable volume
const pointsSound = new Audio('./sounds/points.mp3');
const errorSound = new Audio('./sounds/error.mp3');

/*function startGame() {
    if (gameStarted) return;
    gameStarted = true;
    document.getElementById('startGameBtn').style.display = 'none';
    // Play background music if enabled
    if (typeof musicEnabled === 'undefined' || musicEnabled) {
        bgMusic.currentTime = 0;
        bgMusic.volume = 0.2;
        bgMusic.play();
    }
    // Place an initial egg at a random location
    //placeRandomEgg();
    // Start egg scheduling
    //scheduleNextEgg();
    // Start random movement
    enableRandomMovement();
}*/

document.getElementById('startGameBtn').addEventListener('click', startGame);


function drawHexagon(x, y, size, fillStyle, strokeStyle) {
    ctx.save();
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const angle = Math.PI / 3 * i + Math.PI / 6; // flat-topped orientation
        const px = x + size * Math.cos(angle);
        const py = y + size * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = fillStyle;
    ctx.fill();
    ctx.restore();
}

function drawHexGrid(size) {
    const horizSpacing = size * Math.sqrt(3); // width between centers
    const vertSpacing = size * 1.5;           // height between rows

    const cols = Math.ceil(canvas.width / horizSpacing) + 1;
    const rows = Math.ceil(canvas.height / vertSpacing) + 1;

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const x = col * horizSpacing + (row % 2) * (horizSpacing / 2);
            const y = row * vertSpacing;
            drawHexagon(x, y, size, "#b9f6ca", "#388e3c");
        }
    }
}

const hatchSound = new Audio('./sounds/egg_crack.mp3'); // Fun pop sound

function createNewDinosaur(x,y) {
     // Random dino type: 0 or 1
    const type = Math.floor(Math.random() * species.length);
    const dino = new Dinosaur(x, y, type, species[type]);
    dinosaurs.push(dino);
    draw();
}

function placeRandomEgg() {
    // Don't place new eggs if max dinosaurs reached
    if (dinosaurs.length >= 15) return;
    const minX = 200;
    const maxX = canvas.width - eggSize;
    const minY = 20;
    const maxY = canvas.height - eggSize;
    const x = Math.floor(Math.random() * (maxX - minX)) + minX;
    const y = Math.floor(Math.random() * (maxY - minY)) + minY;
    // Set hatch time between 3 and 6 seconds
    const hatchTime = 3000 + Math.random() * 3000;
    const egg = { x, y, hatching: true };
    eggs.push(egg);
    draw();
    setTimeout(() => {
        const idx = eggs.indexOf(egg);
        if (idx !== -1) {
            if (dinosaurs.length < 15) {
                hatchSound.currentTime = 0;
                hatchSound.play();
                // Use a timeout to remove the egg and create the dinosaur after the sound duration
                setTimeout(() => {
                    const idx2 = eggs.indexOf(egg);
                    if (idx2 !== -1) eggs.splice(idx2, 1);
                    createNewDinosaur(x, y);
                    draw();
                }, hatchSound.duration ? hatchSound.duration * 1000 : 700); // fallback duration
            } else {
                eggs.splice(idx, 1);
                draw();
            }
        }
    }, hatchTime);
}

function scheduleNextEgg() {
    // Random delay: 20s to 40s
    const delay = 10000 + Math.random() * 10000;
    setTimeout(() => {
        // Only schedule new eggs if under max
        if (dinosaurs.length < 15) {
            placeRandomEgg();
            scheduleNextEgg();
        }
    }, delay);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const hexSize = 45;
    drawHexGrid(hexSize);

    // Draw eggs
    for (const egg of eggs) {
        ctx.save();
        ctx.font = `${eggSize}px sans-serif`;
        ctx.textBaseline = 'top';
        ctx.fillText(eggIcon, egg.x, egg.y);
        // If this egg is for a specific dino, draw a small dino icon above
        if (egg.dinoIdx !== undefined) {
            const img = species[egg.dinoIdx]?.img;
            if (img && img.complete) {
                ctx.drawImage(img, egg.x, egg.y - 28, 28, 28);
            }
        }
        ctx.restore();
    }

    // Draw dinosaurs
    for (const dino of dinosaurs) {
        ctx.save();
        dino.draw(ctx);
        ctx.restore();
    }
}

// Wait for both images to load before first draw
let imagesLoaded = 0;
dinosaurs.forEach(d => {
    d.img.onload = () => {
        imagesLoaded++;
        if (imagesLoaded === dinosaurs.length) {
            draw();
        }
    };
});

let points = 0;
let playerName = '';

function updatePointsDisplay() {
    let el = document.getElementById('pointsDisplay');
    if (!el) {
        el = document.createElement('div');
        el.id = 'pointsDisplay';
        el.style.position = 'fixed';
        el.style.top = '20px';
        el.style.right = '30px';
        el.style.background = '#fff8e1';
        el.style.color = '#6d4c41';
        el.style.fontSize = '1.5em';
        el.style.fontWeight = 'bold';
        el.style.padding = '10px 24px';
        el.style.borderRadius = '12px';
        el.style.boxShadow = '0 2px 8px #0002';
        el.style.zIndex = 100;
        document.body.appendChild(el);
    }
    el.textContent = playerName ? `Puntos de ${playerName}: ${points}` : `Puntos: ${points}`;
}

// Show welcome modal and handle name input
window.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('welcomeModal');
    const input = document.getElementById('playerNameInput');
    const btn = document.getElementById('welcomeContinueBtn');
    input.focus();
    btn.addEventListener('click', () => {
        const name = input.value.trim();
        if (name.length > 0) {
            playerName = name;
            modal.style.display = 'none';
            updatePointsDisplay();
            // Start the game after entering the name
            startGame();
        } else {
            input.style.borderColor = '#e53935';
            input.focus();
        }
    });
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') btn.click();
    });
});

// Remove the startGameBtn click event, since the game now starts after entering the name
// document.getElementById('startGameBtn').addEventListener('click', startGame);
document.getElementById('startGameBtn').style.display = 'none';

document.addEventListener('DOMContentLoaded', () => {
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    sidebarItems.forEach(item => {
        item.addEventListener('dragstart', (e) => {
            if (item.classList.contains('dino-menu')) {
                draggingStat = null;
                e.dataTransfer.setData('text/plain', 'dino-' + item.getAttribute('data-dino'));
            } else {
                draggingStat = item.getAttribute('data-type');
                e.dataTransfer.setData('text/plain', draggingStat);
            }
        });
        item.addEventListener('dragend', () => {
            draggingStat = null;
        });
    });
    updatePointsDisplay();

    // Music toggle logic
    const musicToggleBtn = document.getElementById('musicToggleBtn');
    const musicIcon = document.getElementById('musicIcon');
    let musicEnabled = true;
    function updateMusicButton() {
        musicIcon.textContent = musicEnabled ? '🔊' : '🔇';
        musicIcon.style.color = musicEnabled ? '#4caf50' : '#bdbdbd';
    }
    updateMusicButton();
    musicToggleBtn.addEventListener('click', () => {
        musicEnabled = !musicEnabled;
        if (musicEnabled) {
            bgMusic.play();
        } else {
            bgMusic.pause();
        }
        updateMusicButton();
    });
});

canvas.addEventListener('dragover', (e) => {
    e.preventDefault();
});

function isFood(draggingStat) {
    return ['meat', 'veggie', 'egg', 'shrimp'].includes(draggingStat);
}

canvas.addEventListener('drop', (e) => {
    const data = e.dataTransfer.getData('text/plain');
    if (data && data.startsWith('dino-')) {
        // Place an egg for the selected dinosaur type
        const dinoIdx = parseInt(data.replace('dino-', ''));
        if (!isNaN(dinoIdx) && dinoIdx >= 0 && dinoIdx < species.length && dinosaurs.length < 15) {
            const rect = canvas.getBoundingClientRect();
            const mx = e.clientX - rect.left;
            const my = e.clientY - rect.top;
            // Place an egg at the drop location for this species
            placeEggForSpecies(mx, my, dinoIdx);
            draw();
        }
        draggingStat = null;
        return;
    }
    if (!draggingStat) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    for (const dino of dinosaurs) {
        if (dino.isPointInside(mx, my)) {
            let statReplenished = false;
            let wrongFood = false;
            if (draggingStat === 'health' && dino.health < 100) {
                dino.health = 100;
                statReplenished = true;
            }
            if (draggingStat === 'hygene' && dino.hygene < 100) {
                dino.hygene = 100;
                statReplenished = true;
            }
            if (isFood(draggingStat) && dino.hunger < 100) {
                if (dino.eat(draggingStat)) {
                    statReplenished = true;
                } else {
                    wrongFood = true;
                }
            }
            if (statReplenished) {
                points++;
                updatePointsDisplay();
                pointsSound.currentTime = 0;
                pointsSound.play();
            } else if (wrongFood) {
                errorSound.currentTime = 0;
                errorSound.play();
            }
            draw();
            break;
        }
    }
    draggingStat = null;
});

function placeEggForSpecies(x, y, dinoIdx) {
    // Place an egg at (x, y) that will hatch into the given species
    if (dinosaurs.length >= 15) return;
    const egg = { x, y, hatching: true, dinoIdx };
    eggs.push(egg);
    draw();
    setTimeout(() => {
        const idx = eggs.indexOf(egg);
        if (idx !== -1) {
            if (dinosaurs.length < 15) {
                hatchSound.currentTime = 0;
                hatchSound.play();
                setTimeout(() => {
                    const idx2 = eggs.indexOf(egg);
                    if (idx2 !== -1) eggs.splice(idx2, 1);
                    createNewDinosaur(x, y, dinoIdx);
                    draw();
                }, hatchSound.duration ? hatchSound.duration * 1000 : 700);
            } else {
                eggs.splice(idx, 1);
                draw();
            }
        }
    }, 3000 + Math.random() * 3000);
}

function createNewDinosaur(x, y, forcedType) {
    // If forcedType is provided, use it, else random
    const type = typeof forcedType === 'number' ? forcedType : Math.floor(Math.random() * species.length);
    const dino = new Dinosaur(x, y, type, species[type]);
    dinosaurs.push(dino);
    draw();
}

// Remove all drag and selection logic from event listeners
canvas.addEventListener('mousedown', (e) => {
    // Only select a dinosaur (optional: highlight on click)
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    let found = false;
    for (const dino of dinosaurs) {
        if (dino.isPointInside(mx, my)) {
            dinosaurs.forEach(d => d.selected = false);
            dino.selected = true;
            found = true;
            if (!dino.dead) {
                dino.growl();
            }
            break;
        }
    }
    if (!found) {
        dinosaurs.forEach(d => d.selected = false);
    }
    draw();
});

// Remove mousemove and mouseup listeners

// Remove dragging variables
// let selectedDino = null;
// let offsetX = 0, offsetY = 0;
// let dragging = false;

// Add random movement interval
enableRandomMovement();
function enableRandomMovement() {
    setInterval(() => {
        for (const dino of dinosaurs) {
            // Only move if all stats are above zero
            if (dino.health > 0 && dino.hunger > 0 && dino.hygene > 0) {
                dino.moveRandomly(canvas.width, canvas.height);
            }
            // Randomly pick a stat to decrease: 0=health, 1=hunger, 2=hygene
            const stat = Math.floor(Math.random() * 3);
            let decrease;
            if (stat === 0) {
                // Health: 5x slower than hunger
                decrease = (Math.random() * 1.0) / 5;
                let statBefore = dino.health;
                dino.health = Math.max(0, dino.health - decrease);
            } else if (stat === 1) {
                // Hunger: normal speed
                decrease = Math.random() * 1.0;
                let statBefore = dino.hunger;
                dino.hunger = Math.max(0, dino.hunger - decrease);
            } else {
                // Hygene: 2.5x slower than hunger
                decrease = (Math.random() * 1.0) / 2.5;
                let statBefore = dino.hygene;
                dino.hygene = Math.max(0, dino.hygene - decrease);
            }
        }
        draw();
    }, 100);
}

// Only start egg scheduling in startGame()
function startGame() {
    if (gameStarted) return;
    gameStarted = true;
    document.getElementById('startGameBtn').style.display = 'none';
    // Play background music if enabled
    if (typeof musicEnabled === 'undefined' || musicEnabled) {
        bgMusic.currentTime = 0;
        bgMusic.volume = 0.2;
        bgMusic.play();
    }
    // Place an initial egg at a random location
    //placeRandomEgg();
    // Start egg scheduling
    //scheduleNextEgg();
    // Start random movement
    enableRandomMovement();
}

// Add death check interval
setInterval(() => {
    const now = Date.now();
    for (let i = dinosaurs.length - 1; i >= 0; i--) {
        const dino = dinosaurs[i];
        if (dino.dead) {
            // Remove bone after 10 seconds
            if (dino.deadSince && now - dino.deadSince > 10000) {
                dinosaurs.splice(i, 1);
            }
            continue;
        }
        if (dino.health === 0 && dino.hunger === 0 && dino.hygene === 0) {
            if (!dino.zeroStatsSince) {
                dino.zeroStatsSince = now;
            } else if (now - dino.zeroStatsSince > 20000) {
                dino.dead = true;
                dino.deadSince = now;
                dino.selected = false;
            }
        } else {
            dino.zeroStatsSince = null;
        }
    }
    draw();
}, 500);
