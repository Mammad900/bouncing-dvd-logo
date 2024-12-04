// Canvas
let canvas = document.querySelector("canvas");
canvas.width = window.innerWidth * (devicePixelRatio||1);
canvas.height = window.innerHeight * (devicePixelRatio||1);
let ctx = canvas.getContext("2d")

// Global state variables
let isClear = false;
let globalSpeed = 1;
let crazy = 0;
let balls = [];

// Constants
const texts = ["goatman", 'goatMan', 'GoatMan', 'goat-man', 'goat_man', 'GOAT_MAN', 'GOATMAN'];
const fonts = ['serif', 'sans-serif', 'monospace'];


class Ball {
    constructor(x, y, vx, vy, colorR = 0, colorG = 0, colorB = 0, text, font, italic, bold, fontSize) {

        // Assign fields, anything not specified is random
        this.text = text === undefined ? random(0, texts.length - 1) : text;
        this.font = font === undefined ? random(0, fonts.length - 1) : font;
        this.italic = italic === undefined ? random(0, 1) : italic;
        this.bold = bold === undefined ? random(0, 1) : italic;
        this.fontSize = fontSize || Math.random() * 1.5 + 0.5;
        this.vx = vx || random(1, 10);
        this.vy = vy || random(1, 10);
        this.colorR = colorR || random(0, 255);
        this.colorG = colorG || random(0, 255);
        this.colorB = colorB || random(0, 255);

        // Use an off screen canvas to draw text only once
        this.canvas = new OffscreenCanvas(this.fontSize * 300, this.fontSize * 100);
        this.ctx = this.canvas.getContext('2d');
        this.updateProps()
        
        // Calculate size
        const s = this.ctx.measureText(texts[this.text]);
        this.w = s.width;
        this.h = this.fontSize * 60;

        // Pick random (or not) position
        this.x = x || random(0 + this.w, innerWidth - (this.w));
        this.y = y || random(0 + this.h, innerHeight - (this.h / 3));

        this.updateProps() 
    }

    // Updates the off screen canvas
    updateProps() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = `rgb(${this.colorR},${this.colorG},${this.colorB})`

        this.ctx.font = `${this.bold ? 'bold ' : ''}${this.italic ? 'italic ' : ''}${this.fontSize * 50}px ${fonts[this.font]}`;

        this.ctx.fillText(texts[this.text], 0, this.h);
    }

    // Draws the text on main canvas
    draw() {
        ctx.drawImage(this.canvas, this.x, this.y - this.h);
    }

    // Updates position
    update() {
        if ((this.x + this.w > innerWidth && this.vx > 0) || (this.x < 0 && this.vx < 0)) {
            this.vx *= -1;
            //this.colorR = random(1, 400);
            //this.colorG = random(1, 400);
            //this.colorB = random(1, 400);
            //this.updateProps();
        }
        if (((this.y + this.h / 3) > innerHeight && this.vy > 0) || (this.y - this.h / 2 < 0 && this.vy < 0)) {
            this.vy *= -1;
            //this.colorR = random(1, 400);
            //this.colorG = random(1, 400);
            //this.colorB = random(1, 400);
            //this.updateProps();
        }
        this.vx += crazy;
        this.vy += crazy;

        this.x += this.vx * globalSpeed
        this.y += this.vy * globalSpeed
        this.draw();
    }

    // Used to save state to local storage
    serialize() {
        return {
            x: this.x,
            y: this.y,
            vx: this.vx,
            vy: this.vy,
            colorR: this.colorR,
            colorG: this.colorG,
            colorB: this.colorB,
            text: this.text,
            font: this.font,
            italic: this.italic,
            bold: this.bold,
            fontSize: this.fontSize
        }
    }
}

// Load balls from storage
let balls_serialized = localStorage.getItem('balls');
if (balls_serialized != null) {
    balls = JSON.parse(balls_serialized).map(
        ({ x, y, vx, vy, colorR, colorG, colorB, text, font, italic, bold, fontSize }) =>
            new Ball(x, y, vx, vy, colorR, colorG, colorB, text, font, italic, bold, fontSize)
    );
}

// First ball
if (!balls.length) {
    balls.push(new Ball());
}

// Start rendering loop
function animate() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    balls.forEach(e => {
        e.update()
    })
    requestAnimationFrame(animate)

}
animate()

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

// Resize canvas
window.addEventListener("resize", e => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
})

// Save ball data
window.addEventListener('beforeunload', () => {
    if (isClear) return;
    localStorage.setItem('balls', JSON.stringify(balls.map(ball => ball.serialize())));
})

document.querySelector("#add").addEventListener("click", e => {
    balls.push(new Ball());
})
document.querySelector("#bulk-add").addEventListener("click", e => {
    const n = document.querySelector('#bulk-add-count').valueAsNumber;
    for (let i = 0; i < n; i++) {
        balls.push(new Ball());
    }
})

document.querySelector("#crazy-moar").addEventListener("click", e => {
    crazy++;
    document.querySelector('#crazy-meter').innerHTML = "Crazy: " + crazy;
})
document.querySelector("#crazy-less").addEventListener("click", e => {
    crazy--;
    document.querySelector('#crazy-meter').innerHTML = "Crazy: " + crazy;
})

document.querySelector("#speed-moar").addEventListener("click", e => {
    globalSpeed *= 1.1;
    document.querySelector('#speed-meter').innerHTML = "Speed: " + globalSpeed.toFixed(1);
})
document.querySelector("#speed-less").addEventListener("click", e => {
    globalSpeed /= 1.1;
    document.querySelector('#speed-meter').innerHTML = "Speed: " + globalSpeed.toFixed(1);
})

document.querySelector("#clear").addEventListener("click", e => {
    // Trick: Clear data from storage and reload - everything will reset
    localStorage.removeItem('balls');
    isClear = true; // make sure we don't save
    window.location.reload();
})
