from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
import redis
import json
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Database connection
def get_db_connection():
    return psycopg2.connect(
        host=os.getenv('DB_HOST', 'postgres'),
        port=os.getenv('DB_PORT', '5432'),
        database=os.getenv('DB_NAME', 'ecommerce'),
        user=os.getenv('DB_USER', 'postgres'),
        password=os.getenv('DB_PASSWORD', 'password')
    )

# Redis connection
redis_client = redis.Redis(
    host=os.getenv('REDIS_HOST', 'redis'),
    port=os.getenv('REDIS_PORT', 6379),
    db=0
)

@app.route('/health')
def health_check():
    return jsonify({'status': 'Product Service is running!'})

@app.route('/products', methods=['GET'])
def get_products():
    try:
        # Check Redis cache first
        cached_products = redis_client.get('products')
        if cached_products:
            return jsonify(json.loads(cached_products))
        
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('SELECT * FROM products')
        products = cur.fetchall()
        
        result = []
        for product in products:
            result.append({
                'id': product[0],
                'name': product[1],
                'description': product[2],
                'price': float(product[3]),
                'stock': product[4]
            })
        
        # Cache results for 5 minutes
        redis_client.setex('products', 300, json.dumps(result))
        
        cur.close()
        conn.close()
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/products', methods=['POST'])
def create_product():
    try:
        data = request.json
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute(
            'INSERT INTO products (name, description, price, stock) VALUES (%s, %s, %s, %s) RETURNING id',
            (data['name'], data['description'], data['price'], data['stock'])
        )
        
        product_id = cur.fetchone()[0]
        conn.commit()
        
        # Clear cache
        redis_client.delete('products')
        
        cur.close()
        conn.close()
        
        return jsonify({'id': product_id, 'message': 'Product created successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3002, debug=True)
