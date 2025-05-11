let pixelSize = 20;
let gridWidth = 20;
let gridHeight = 20;
let currentColor = '#000000';
let lastPixelTime = 0;
const pixelInterval = 5000; // 5 secunde
let isLoggedIn = false;
let username = '';

function setup() {
    let canvas = createCanvas(gridWidth * pixelSize, gridHeight * pixelSize);
    canvas.parent('canvas-container');
    background(255);
    drawGrid();
    loadCanvasState();
    updateTimer();
}

function drawGrid() {
    stroke(200);
    for (let x = 0; x <= width; x += pixelSize) {
        line(x, 0, x, height);
    }
    for (let y = 0; y <= height; y += pixelSize) {
        line(0, y, width, y);
    }
}

function mousePressed() {
    if (!isLoggedIn) return;
    const currentTime = Date.now();
    if (currentTime - lastPixelTime < pixelInterval) {
        alert('Așteaptă până poți plasa următorul pixel!');
        return;
    }
    if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
        let gridX = floor(mouseX / pixelSize);
        let gridY = floor(mouseY / pixelSize);
        fill(currentColor);
        noStroke();
        rect(gridX * pixelSize, gridY * pixelSize, pixelSize, pixelSize);
        drawGrid();
        lastPixelTime = currentTime;
        savePixel(gridX, gridY, currentColor);
    }
}

function savePixel(x, y, color) {
    fetch('/save-pixel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ x, y, color })
    }).catch(err => console.error('Eroare la salvarea pixelului:', err));
}

function loadCanvasState() {
    fetch('/load-canvas')
        .then(response => response.json())
        .then(pixels => {
            pixels.forEach(pixel => {
                fill(pixel.color);
                noStroke();
                rect(pixel.x * pixelSize, pixel.y * pixelSize, pixelSize, pixelSize);
            });
            drawGrid();
        })
        .catch(err => console.error('Eroare la încărcarea canvas-ului:', err));
}

function clearCanvas() {
    if (username !== 'admin') {
        alert('Doar adminul poate șterge canvas-ul!');
        return;
    }
    fetch('/clear-canvas', { method: 'POST' })
        .then(() => {
            background(255);
            drawGrid();
        })
        .catch(err => console.error('Eroare la ștergerea canvas-ului:', err));
}

function updateTimer() {
    if (!isLoggedIn) return;
    const timerElement = document.getElementById('timer');
    setInterval(() => {
        const timeLeft = Math.max(0, pixelInterval - (Date.now() - lastPixelTime));
        timerElement.textContent = `Timp rămas: ${(timeLeft / 1000).toFixed(1)}s`;
    }, 100);
}

function login() {
    const usernameInput = document.getElementById('username').value;
    const passwordInput = document.getElementById('password').value;
    if (!usernameInput || !passwordInput) {
        alert('Introdu nume și parolă!');
        return;
    }
    fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameInput, password: passwordInput })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                isLoggedIn = true;
                username = usernameInput;
                document.getElementById('login-container').style.display = 'none';
                document.getElementById('drawing-container').style.display = 'block';
            } else {
                alert('Logare eșuată! Încearcă din nou.');
            }
        })
        .catch(err => console.error('Eroare la logare:', err));
}

document.getElementById('colorPicker').addEventListener('input', function() {
    currentColor = this.value;
});