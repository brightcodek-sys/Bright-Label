const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname)));

// helper to read/write JSON files safely
function readJSON(file) {
    try {
        const data = fs.readFileSync(path.join(__dirname, file), 'utf8');
        return JSON.parse(data);
    } catch (err) {
        if (err.code === 'ENOENT') return [];
        throw err;
    }
}

function writeJSON(file, data) {
    fs.writeFileSync(path.join(__dirname, file), JSON.stringify(data, null, 2), 'utf8');
}

// PRODUCTS API
app.get('/api/products', (req, res) => {
    const products = readJSON('products.json');
    res.json(products);
});

app.post('/api/products', (req, res) => {
    const prod = req.body;
    if (!prod.name || typeof prod.price !== 'number' || !prod.category || !prod.image) {
        return res.status(400).json({ error: 'Invalid product payload' });
    }
    const products = readJSON('products.json');
    // assign id if not provided
    prod.id = prod.id || Date.now();
    products.push(prod);
    writeJSON('products.json', products);
    res.status(201).json(prod);
});

app.delete('/api/products/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });
    let products = readJSON('products.json');
    const originalLength = products.length;
    products = products.filter(p => p.id !== id);
    if (products.length === originalLength) {
        return res.status(404).json({ error: 'Product not found' });
    }
    writeJSON('products.json', products);
    res.json({ success: true });
});

// ORDERS API
app.get('/api/orders', (req, res) => {
    const orders = readJSON('orders.json');
    res.json(orders);
});

app.post('/api/orders', (req, res) => {
    const order = req.body;
    if (!order.email || !Array.isArray(order.items) || typeof order.total !== 'number') {
        return res.status(400).json({ error: 'Invalid order payload' });
    }
    const orders = readJSON('orders.json');
    order.timestamp = new Date().toISOString();
    orders.push(order);
    writeJSON('orders.json', orders);
    res.status(201).json(order);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
