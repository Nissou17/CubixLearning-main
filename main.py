from flask import Flask, render_template, request, jsonify, session
import sqlite3, hashlib

app = Flask(__name__, template_folder="templates", static_folder="static")
app.secret_key = "cubixlearninglepixpourpersonnesdébutantes" 

DB = "users.db"

def init_db():
    with sqlite3.connect(DB) as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id       INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT    UNIQUE NOT NULL,
                password TEXT    NOT NULL
            )
        """)
        conn.commit()

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

# ── Routes ───────────────────────────────────────────────────────────────────

@app.route("/")
def index():
    user = session.get("username")
    return render_template("main.html", user=user)

@app.route("/register", methods=["POST"])
def register():
    data     = request.get_json()
    username = data.get("username", "").strip()
    password = data.get("password", "").strip()

    if not username or not password:
        return jsonify({"ok": False, "msg": "Champs requis."})
    if len(password) < 6:
        return jsonify({"ok": False, "msg": "Mot de passe trop court (min 6 caractères)."})

    try:
        with sqlite3.connect(DB) as conn:
            conn.execute(
                "INSERT INTO users (username, password) VALUES (?, ?)",
                (username, hash_password(password))
            )
            conn.commit()
        return jsonify({"ok": True, "msg": "Compte créé ! Vous pouvez vous connecter."})
    except sqlite3.IntegrityError:
        return jsonify({"ok": False, "msg": "Ce nom d'utilisateur est déjà pris."})

@app.route("/login", methods=["POST"])
def login():
    data     = request.get_json()
    username = data.get("username", "").strip()
    password = data.get("password", "").strip()

    with sqlite3.connect(DB) as conn:
        row = conn.execute(
            "SELECT id FROM users WHERE username=? AND password=?",
            (username, hash_password(password))
        ).fetchone()

    if row:
        session["username"] = username
        return jsonify({"ok": True, "msg": f"Bienvenue, {username} !"})
    return jsonify({"ok": False, "msg": "Identifiants incorrects."})

@app.route("/logout")
def logout_route():
    session.clear()
    return jsonify({"ok": True})

# ── Lancement ─────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    init_db()
    app.run(debug=False)