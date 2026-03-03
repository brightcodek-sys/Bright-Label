const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 3000;

// load secret and admin password from environment or defaults
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '$2b$10$YmkdK4yQWyTXfQFtskOtDOHxQTYOsGcrANqXO2lR/5e0inr8aZ6b2';
// the default hash corresponds to plaintext '505060' for backwards compatibility

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

// authentication middleware
function authenticate(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing token' });
    }
    const token = auth.slice(7);
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.admin = payload;
        next();
    } catch (e) {
        return res.status(401).json({ error: 'Invalid token' });
    }
}

// login endpoint
app.post('/api/login', async (req, res) => {
    const { password } = req.body;
    if (!password) return res.status(400).json({ error: 'Password required' });
    const match = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
    if (!match) return res.status(401).json({ error: 'Bad credentials' });

    const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '2h' });
    res.json({ token });
});

// PRODUCTS API
app.get('/api/products', (req, res) => {
    const products = readJSON('products.json');
    res.json(products);
});

app.post('/api/products', authenticate, (req, res) => {
    const prod = req.body;
    console.log('POST /api/products', JSON.stringify(prod, null, 2));
    
    if (!prod.name) {
        console.error('Missing name');
        return res.status(400).json({ error: 'Missing product name' });
    }
    if (typeof prod.price !== 'number' || isNaN(prod.price)) {
        console.error('Invalid price:', prod.price, typeof prod.price);
        return res.status(400).json({ error: 'Valid price (number) required' });
    }
    if (!prod.category) {
        console.error('Missing category');
        return res.status(400).json({ error: 'Missing product category' });
    }
    if (!prod.image) {
        console.error('Missing image');
        return res.status(400).json({ error: 'Missing product image' });
    }
    
    try {
        const products = readJSON('products.json');
        prod.id = prod.id || Date.now();
        products.push(prod);
        writeJSON('products.json', products);
        console.log('Product saved successfully:', prod.id);
        res.status(201).json(prod);
    } catch (err) {
        console.error('Error writing products.json:', err);
        res.status(500).json({ error: 'Server error: ' + err.message });
    }
});

app.delete('/api/products/:id', authenticate, (req, res) => {
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
app.get('/api/orders', authenticate, (req, res) => {
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
