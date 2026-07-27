const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PUERTO = process.env.PORT || 3000;

// Middleware — permite recibir JSON y servir archivos estáticos
app.use(express.json());
app.use(express.static('.'));

// ===== RUTAS DE DECKS =====

// GET /decks — devuelve todos los decks
app.get('/decks', (req, res) => {
    let contenido = fs.readFileSync('./decks.json', 'utf8');
    let decks = JSON.parse(contenido);
    res.json(decks);
});

// GET /decks/:tcg — devuelve decks filtrados por TCG
app.get('/decks/:tcg', (req, res) => {
    let contenido = fs.readFileSync('./decks.json', 'utf8');
    let decks = JSON.parse(contenido);
    let filtrados = decks.filter(deck => deck.tcg === req.params.tcg);
    res.json(filtrados);
});

// ===== RUTAS DE JUGADORES =====

// GET /jugadores — devuelve todos los jugadores
app.get('/jugadores', (req, res) => {
    let contenido = fs.readFileSync('./jugadores.json', 'utf8');
    let jugadores = JSON.parse(contenido);
    res.json(jugadores);
});

// POST /jugadores — agrega un jugador nuevo
app.post('/jugadores', (req, res) => {
    let jugadores = JSON.parse(fs.readFileSync('./jugadores.json', 'utf8'));

    let jugador = {
        id: jugadores.length + 1,
        nombre: req.body.nombre,
        deck: null
    };

    jugadores.push(jugador);
    fs.writeFileSync('./jugadores.json', JSON.stringify(jugadores, null, 2));
    res.json({ mensaje: "Jugador agregado", jugadores });
});
// PUT /jugadores/asignar — asigna decks a todos los jugadores
app.put('/jugadores/asignar', (req, res) => {
    let jugadores = JSON.parse(fs.readFileSync('./jugadores.json', 'utf8'));
    let decks = JSON.parse(fs.readFileSync('./decks.json', 'utf8'));

    let tcg = req.body.tcg;
    let decksFiltrados = decks.filter(deck => deck.tcg === tcg);

    if (decksFiltrados.length < jugadores.length) {
        return res.status(400).json({ 
            error: `No hay suficientes decks de ${tcg} para todos los jugadores.` 
        });
    }

    jugadores.forEach(jugador => {
        let indice = Math.floor(Math.random() * decksFiltrados.length);
        jugador.deck = decksFiltrados[indice].nombre;
        decksFiltrados.splice(indice, 1);
    });

    fs.writeFileSync('./jugadores.json', JSON.stringify(jugadores, null, 2));
    res.json({ mensaje: "Decks asignados", jugadores });
});

// DELETE /jugadores/:nombre — elimina un jugador
app.delete('/jugadores/:nombre', (req, res) => {
    let jugadores = JSON.parse(fs.readFileSync('./jugadores.json', 'utf8'));
    let nombre = req.params.nombre;

    let jugadorElim = jugadores.find(j => j.nombre === nombre);
    if (!jugadorElim) {
        return res.status(404).json({ error: "Jugador no encontrado" });
    }

    jugadores = jugadores.filter(j => j.nombre !== nombre);
    fs.writeFileSync('./jugadores.json', JSON.stringify(jugadores, null, 2));
    res.json({ mensaje: `${nombre} eliminado`, jugador: jugadorElim });
});

// Iniciar servidor
app.listen(PUERTO, () => {
    console.log(`Servidor corriendo en http://localhost:${PUERTO}`);
});

// POST /decks — agregar un deck nuevo
app.post('/decks', (req, res) => {
    let decks = JSON.parse(fs.readFileSync('./decks.json', 'utf8'));
    
    let deck = {
        id: decks.length + 1,
        nombre: req.body.nombre,
        tcg: req.body.tcg
    };

    decks.push(deck);
    fs.writeFileSync('./decks.json', JSON.stringify(decks, null, 2));
    res.json({ mensaje: "Deck agregado", decks });
});

// DELETE /decks/:nombre — eliminar un deck
app.delete('/decks/:nombre', (req, res) => {
    let decks = JSON.parse(fs.readFileSync('./decks.json', 'utf8'));
    let nombre = req.params.nombre;

    let deckElim = decks.find(d => d.nombre === nombre);
    if (!deckElim) {
        return res.status(404).json({ error: "Deck no encontrado" });
    }

    decks = decks.filter(d => d.nombre !== nombre);
    fs.writeFileSync('./decks.json', JSON.stringify(decks, null, 2));
    res.json({ mensaje: `${nombre} eliminado`, deck: deckElim });
});