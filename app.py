from flask import Flask, render_template, request, redirect, url_for, jsonify
import sqlite3

app = Flask(__name__)


def get_db_connection():
    conn = sqlite3.connect('food.db')
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


if __name__ == "__main__":
    app.run(port=5050, debug=True)

