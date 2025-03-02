from flask import Flask, render_template
from food import dishes, drinks, desserts

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html", dishes=dishes)

@app.route("/dish/<int:dish_id>/")
def dish_detail(dish_id):
    dish_item = next((d for d in dishes if d["id"] == dish_id), None)
    if not dish_item:
        return "Блюдо не найдено", 404
    return render_template("dish.html", dish=dish_item)

@app.route("/drinks/")
def drinks_list():
    return render_template("drinks.html", drinks=drinks)

@app.route("/desserts/")
def desserts_list():
    return render_template("desserts.html", desserts=desserts)

if __name__ == "__main__":
    app.run(port=5050, debug=True)
