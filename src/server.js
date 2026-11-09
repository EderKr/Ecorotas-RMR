require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const routeService = require('./route-service');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// NOVO ENDPOINT: Envia a chave de API de forma segura para o front-end carregar o mapa
app.get('/api/maps-key', (req, res) => {
    res.json({ key: process.env.GOOGLE_API_KEY });
});

app.post('/api/route', async (req, res) => {
    try {
        const data = await routeService.calculateRoute(req.body);
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}`);
});
