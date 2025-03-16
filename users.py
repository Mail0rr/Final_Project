from flask import Flask, render_template, redirect, url_for, flash, request, jsonify
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash

# Инициализация Flask-приложения
app = Flask(__name__)
app.secret_key = 'your_secret_key'  # Добавьте секретный ключ для сессий
login_manager = LoginManager()
login_manager.init_app(app)


def baza_user():
    conn = sqlite3.connect('users.db')
    conn.row_factory = sqlite3.Row
    return conn


# Создаем таблицу пользователей, если она не существует
def create_users_table():
    conn = baza_user()
    cursor = conn.cursor()
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        phone TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
    )
    ''')
    conn.commit()
    conn.close()


# Вызываем функцию создания таблицы при запуске
create_users_table()


class User(UserMixin):
    def __init__(self, id, username, phone, password):
        self.id = id
        self.username = username
        self.phone = phone
        self.password = password

    @classmethod
    def create(cls, username, phone, password):
        hashed_password = generate_password_hash(password)
        conn = baza_user()
        cursor = conn.cursor()
        cursor.execute('INSERT INTO users (username, phone, password) VALUES (?, ?, ?)',
                       (username, phone, hashed_password))
        user_id = cursor.lastrowid
        conn.commit()
        conn.close()
        return cls(user_id, username, phone, hashed_password)

    @staticmethod
    def verify_password(stored_password, provided_password):
        return check_password_hash(stored_password, provided_password)

    @classmethod
    def get_by_username(cls, username):
        conn = baza_user()
        user_data = conn.execute('SELECT * FROM users WHERE username = ?', (username,)).fetchone()
        conn.close()
        if user_data:
            return cls(user_data['id'], user_data['username'], user_data['phone'], user_data['password'])
        return None

    @classmethod
    def get_by_id(cls, user_id):
        conn = baza_user()
        user_data = conn.execute('SELECT * FROM users WHERE id = ?', (user_id,)).fetchone()
        conn.close()
        if user_data:
            return cls(user_data['id'], user_data['username'], user_data['phone'], user_data['password'])
        return None


@login_manager.user_loader
def load_user(user_id):
    return User.get_by_id(int(user_id))


@app.route('/login', methods=['GET', 'POST'])
def login_route():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        user = User.get_by_username(username)
        if user and User.verify_password(user.password, password):
            login_user(user)
            return jsonify(success=True, redirect=url_for('home'))
        else:
            return jsonify(success=False, message='Ошибка: неверный логин или пароль.')
    return render_template('login.html')


@app.route('/register', methods=['GET', 'POST'])
def register_route():
    if request.method == 'POST':
        username = request.form['username']
        phone = request.form['phone']
        password = request.form['password']

        # Проверка, существует ли пользователь с таким именем
        existing_user = User.get_by_username(username)
        if existing_user:
            return jsonify(success=False, message='Пользователь с таким именем уже существует.')

        try:
            User.create(username, phone, password)
            return jsonify(success=True, redirect=url_for('login_route'))
        except sqlite3.IntegrityError:
            return jsonify(success=False, message='Номер телефона уже используется.')

    return render_template('register.html')


@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login_route'))


@app.route('/')
def home():
    return render_template('home.html')


if __name__ == '__main__':
    app.run(debug=True)