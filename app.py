from flask import Flask, render_template
from food import dishes, drinks, desserts

app = Flask(__name__)

all_items = dishes + drinks + desserts

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/menu/")
def menu():
    return render_template("menu.html", dishes=dishes, drinks=drinks, desserts=desserts)

@app.route("/order/")
def order():
    return render_template("order.html")

@app.route("/menu/dish/<int:dish_id>/")
def dish_detail(dish_id):
    dish_item = next((d for d in dishes if d["id"] == dish_id), None)
    if not dish_item:
        return "Блюдо не найдено", 404
    return render_template("dish.html", dish=dish_item)

@app.route("/menu/drink/<int:drink_id>/")
def drink_detail(drink_id):
    drink_item = next((d for d in drinks if d["id"] == drink_id), None)
    if not drink_item:
        return "Напиток не найден", 404
    return render_template("drink.html", drink=drink_item)

@app.route("/menu/dessert/<int:dessert_id>/")
def dessert_detail(dessert_id):
    dessert_item = next((d for d in desserts if d["id"] == dessert_id), None)
    if not dessert_item:
        return "Десерт не найден", 404
    return render_template("dessert.html", dessert=dessert_item)

if __name__ == "__main__":
    app.run(port=5050, debug=True)
