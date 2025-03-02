from flask import Flask, render_template
from dishes import dishes

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html", dishes=dishes)

@app.route("/dish/<int:dish_id>/")
def dish_detail(dish_id):
    dish = next((d for d in dishes if d["id"] == dish_id), None)
    if not dish:
        return "Блюдо не найдено", 404
    return render_template("dish.html", dish=dish)

if __name__ == "__main__":
    app.run(port=5050, debug=True)
