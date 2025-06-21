const express = require('express');
const redis = require('redis');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(require('cors')());

const client = redis.createClient({
  host: process.env.REDIS_HOST || 'redis',
  port: process.env.REDIS_PORT || 6379
});

client.connect();

app.get('/health', (req, res) => {
  res.json({ status: 'Cart Service is running!' });
});

// Get user cart
app.get('/cart/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const cart = await client.get(`cart:${userId}`);
    res.json(cart ? JSON.parse(cart) : { items: [], total: 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add item to cart
app.post('/cart/:userId/items', async (req, res) => {
  try {
    const { userId } = req.params;
    const { productId, quantity, price } = req.body;
    
    let cart = await client.get(`cart:${userId}`);
    cart = cart ? JSON.parse(cart) : { items: [], total: 0 };
    
    const existingItem = cart.items.find(item => item.productId === productId);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ productId, quantity, price });
    }
    
    cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    await client.set(`cart:${userId}`, JSON.stringify(cart));
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clear cart
app.delete('/cart/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    await client.del(`cart:${userId}`);
    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Cart service running on port ${PORT}`);
});
