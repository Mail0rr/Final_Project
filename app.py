from flask import Flask, render_template, request, redirect, url_for, jsonify
import sqlite3
from datetime import datetime

app = Flask(__name__)


def get_db_connection():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    return conn


@app.route("/")
def home():
    return render_template("home.html")


@app.route("/order/")
def order():
    return render_template("order.html")


@app.route("/menu/")
def menu():
    conn = get_db_connection()
    dishes = conn.execute('SELECT * FROM dishes').fetchall()
    drinks = conn.execute('SELECT * FROM drinks').fetchall()
    desserts = conn.execute('SELECT * FROM desserts').fetchall()
    conn.close()
    return render_template("menu.html", dishes=dishes, drinks=drinks, desserts=desserts)


@app.route("/search/")
def search():
    query = request.args.get('query', '')
    conn = get_db_connection()

    dishes = conn.execute('SELECT * FROM dishes WHERE name LIKE ?', ('%' + query + '%',)).fetchall()
    drinks = conn.execute('SELECT * FROM drinks WHERE name LIKE ?', ('%' + query + '%',)).fetchall()
    desserts = conn.execute('SELECT * FROM desserts WHERE name LIKE ?', ('%' + query + '%',)).fetchall()

    conn.close()

    if len(dishes) == 1:
        return redirect(url_for('dish_detail', dish_id=dishes[0]['id']))
    elif len(drinks) == 1:
        return redirect(url_for('drink_detail', drink_id=drinks[0]['id']))
    elif len(desserts) == 1:
        return redirect(url_for('dessert_detail', dessert_id=desserts[0]['id']))

    results = {
        "dishes": dishes,
        "drinks": drinks,
        "desserts": desserts
    }

    return render_template("search_results.html", results=results)


@app.route("/api/search")
def api_search():
    query = request.args.get('query', '')

    if not query:
        return jsonify({
            "dishes": [],
            "drinks": [],
            "desserts": []
        })

    conn = get_db_connection()

    dishes = conn.execute('SELECT id, name, image, price FROM dishes WHERE name LIKE ?',
                          ('%' + query + '%',)).fetchall()
    drinks = conn.execute('SELECT id, name, image, price FROM drinks WHERE name LIKE ?',
                          ('%' + query + '%',)).fetchall()
    desserts = conn.execute('SELECT id, name, image, price FROM desserts WHERE name LIKE ?',
                            ('%' + query + '%',)).fetchall()

    conn.close()

    # Преобразуем результаты в список словарей для JSON
    dishes_list = [dict(dish) for dish in dishes]
    drinks_list = [dict(drink) for drink in drinks]
    desserts_list = [dict(dessert) for dessert in desserts]

    return jsonify({
        "dishes": dishes_list,
        "drinks": drinks_list,
        "desserts": desserts_list
    })


@app.route("/menu/dish/<int:dish_id>/")
def dish_detail(dish_id):
    conn = get_db_connection()
    dish_item = conn.execute('SELECT * FROM dishes WHERE id = ?', (dish_id,)).fetchone()
    conn.close()
    if not dish_item:
        return "Блюдо не найдено", 404
    return render_template("dish.html", dish=dish_item)


@app.route("/menu/drink/<int:drink_id>/")
def drink_detail(drink_id):
    conn = get_db_connection()
    drink_item = conn.execute('SELECT * FROM drinks WHERE id = ?', (drink_id,)).fetchone()
    conn.close()
    if not drink_item:
        return "Напиток не найден", 404
    return render_template("drink.html", drink=drink_item)


@app.route("/menu/dessert/<int:dessert_id>/")
def dessert_detail(dessert_id):
    conn = get_db_connection()
    dessert_item = conn.execute('SELECT * FROM desserts WHERE id = ?', (dessert_id,)).fetchone()
    conn.close()
    if not dessert_item:
        return "Десерт не найден", 404
    return render_template("dessert.html", dessert=dessert_item)


@app.post("/api/place-order")
def place_order():
    try:
        data = request.json

        if not data or not all(key in data for key in ['name', 'phone', 'address', 'payment_method', 'cart_items']):
            return jsonify({
                "success": False,
                "message": "Missing required fields"
            }), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("PRAGMA table_info(orders)")
        columns = [column[1] for column in cursor.fetchall()]

        if 'orders' in get_table_names(conn) and 'name' not in columns:
            cursor.execute("ALTER TABLE orders RENAME TO orders_old")

            cursor.execute('''
            CREATE TABLE orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                phone TEXT NOT NULL,
                address TEXT NOT NULL,
                payment_method TEXT NOT NULL,
                items_list TEXT NOT NULL,
                total_amount REAL NOT NULL,
                status TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            ''')

            cursor.execute("DROP TABLE orders_old")
        else:
            cursor.execute('''
            CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                phone TEXT NOT NULL,
                address TEXT NOT NULL,
                payment_method TEXT NOT NULL,
                items_list TEXT NOT NULL,
                total_amount REAL NOT NULL,
                status TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            ''')

        cursor.execute('''
        CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL,
            item_type TEXT NOT NULL,
            item_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL,
            price REAL NOT NULL,
            FOREIGN KEY (order_id) REFERENCES orders (id)
        )
        ''')

        total_amount = sum(item['price'] * item['quantity'] for item in data['cart_items'])

        items_list = data.get('items_list', '')
        if not items_list:
            items_list = ', '.join([f"{item['name']} ({item['quantity']} шт.)" for item in data['cart_items']])

        cursor.execute('''
        INSERT INTO orders (name, phone, address, payment_method, items_list, total_amount, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
        data['name'], data['phone'], data['address'], data['payment_method'], items_list, total_amount, 'pending'))

        order_id = cursor.lastrowid

        for item in data['cart_items']:
            cursor.execute('''
            INSERT INTO order_items (order_id, item_type, item_id, quantity, price)
            VALUES (?, ?, ?, ?, ?)
            ''', (order_id, item['type'], item['id'], item['quantity'], item['price']))

        conn.commit()
        conn.close()

        return jsonify({
            "success": True,
            "message": "Заказ успешно оформлен",
            "order_id": order_id
        })

    except Exception as e:
        print(f"Error placing order: {str(e)}")
        return jsonify({
            "success": False,
            "message": f"Произошла ошибка при оформлении заказа: {str(e)}"
        }), 500


def get_table_names(conn):
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    return [row[0] for row in cursor.fetchall()]


if __name__ == "__main__":
    app.run(port=5050, debug=True)