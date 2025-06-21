import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost';

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
    const token = localStorage.getItem('token');
    if (token) {
      setUser(JSON.parse(localStorage.getItem('user')));
    }
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}:3002/products`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product) => {
    if (!user) {
      alert('Please login first!');
      return;
    }

    try {
      const response = await axios.post(`${API_BASE}:3003/cart/${user.id}/items`, {
        productId: product.id,
        quantity: 1,
        price: product.price
      });
      setCart(response.data);
      alert('Product added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE}:3001/login`, { email, password });
      setUser(response.data.user);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      alert('Login successful!');
    } catch (error) {
      alert('Login failed!');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCart({ items: [], total: 0 });
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🛒 E-Commerce Docker Project</h1>
        {user ? (
          <div>
            <span>Welcome, {user.username}!</span>
            <button onClick={logout} style={{ marginLeft: '10px' }}>Logout</button>
          </div>
        ) : (
          <LoginForm onLogin={login} />
        )}
      </header>

      <main className="App-main">
        <div className="products-section">
          <h2>Products</h2>
          {loading ? (
            <p>Loading products...</p>
          ) : (
            <div className="products-grid">
              {products.map(product => (
                <div key={product.id} className="product-card">
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                  <p><strong>${product.price}</strong></p>
                  <p>Stock: {product.stock}</p>
                  <button 
                    onClick={() => addToCart(product)}
                    disabled={product.stock === 0}
                  >
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {user && (
          <div className="cart-section">
            <h2>Shopping Cart</h2>
            <p>Items: {cart.items.length}</p>
            <p>Total: ${cart.total.toFixed(2)}</p>
          </div>
        )}
      </main>
    </div>
  );
}

function LoginForm({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">Login</button>
    </form>
  );
}

export default App;
