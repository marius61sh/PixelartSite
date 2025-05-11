const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(__dirname));

const canvasFile = path.join(__dirname, 'canvas.json');
const usersFile = path.join(__dirname, 'users.json');

// Inițializează fișierele JSON dacă nu există
async function initializeFiles() {
    try {
        await fs.access(canvasFile);
    } catch {
        await fs.writeFile(canvasFile, JSON.stringify([]));
    }
    try {
        await fs.access(usersFile);
    } catch {
        await fs.writeFile(usersFile, JSON.stringify([]));
    }
}
initializeFiles();

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const usersData = await fs.readFile(usersFile, 'utf8');
        let users = JSON.parse(usersData);
        const user = users.find(u => u.username === username);
        if (user) {
            if (user.password === password) {
                res.json({ success: true });
            } else {
                res.json({ success: false });
            }
        } else {
            users.push({ username, password });
            await fs.writeFile(usersFile, JSON.stringify(users, null, 2));
            res.json({ success: true });
        }
    } catch (err) {
        console.error('Eroare la logare:', err);
        res.status(500).json({ success: false });
    }
});

app.post('/save-pixel', async (req, res) => {
    const { x, y, color } = req.body;
    try {
        const canvasData = await fs.readFile(canvasFile, 'utf8');
        let pixels = JSON.parse(canvasData);
        pixels = pixels.filter(p => p.x !== x || p.y !== y); // Suprascrie pixelul existent
        pixels.push({ x, y, color });
        await fs.writeFile(canvasFile, JSON.stringify(pixels, null, 2));
        res.json({ success: true });
    } catch (err) {
        console.error('Eroare la salvarea pixelului:', err);
        res.status(500).json({ success: false });
    }
});

app.get('/load-canvas', async (req, res) => {
    try {
        const canvasData = await fs.readFile(canvasFile, 'utf8');
        const pixels = JSON.parse(canvasData);
        res.json(pixels);
    } catch (err) {
        console.error('Eroare la încărcarea canvas-ului:', err);
        res.status(500).json([]);
    }
});

app.post('/clear-canvas', async (req, res) => {
    try {
        await fs.writeFile(canvasFile, JSON.stringify([]));
        res.json({ success: true });
    } catch (err) {
        console.error('Eroare la ștergerea canvas-ului:', err);
        res.status(500).json({ success: false });
    }
});

app.listen(port, () => {
    console.log(`Server pornit pe http://localhost:${port}`);
});