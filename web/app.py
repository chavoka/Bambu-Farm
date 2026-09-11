import os
import time
from datetime import datetime
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text

app = Flask(__name__)

# Формирование строки подключения к PostgreSQL из переменных окружения
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    f"postgresql://{os.getenv('DB_USER', 'app_user')}:{os.getenv('DB_PASSWORD', 'secret_password')}@{os.getenv('DB_HOST', 'db')}:{os.getenv('DB_PORT', '5432')}/{os.getenv('DB_NAME', 'app_db')}"
)

app.config["SQLALCHEMY_DATABASE_URI"] = DATABASE_URL
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)

# Модель для демонстрации работы с базой данных
class Note(db.Model):
    __tablename__ = "notes"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    content = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "content": self.content,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

# Инициализация таблиц с повторными попытками при первом старте
def wait_for_db_and_create_tables():
    max_retries = 10
    retry_interval = 2
    for attempt in range(1, max_retries + 1):
        try:
            with app.app_context():
                # Проверка живого соединения
                db.session.execute(text("SELECT 1"))
                db.create_all()
                print("✅ Успешное подключение к PostgreSQL и создание таблиц.")
                return
        except Exception as e:
            print(f"⏳ Попытка {attempt}/{max_retries}: ожидание доступности PostgreSQL... ({e})")
            time.sleep(retry_interval)
    print("❌ Не удалось подключиться к базе данных после нескольких попыток.")

# Главная страница
@app.route("/", methods=["GET"])
def index():
    try:
        # Получение версии PostgreSQL
        result = db.session.execute(text("SELECT version();")).scalar()
        notes_count = Note.query.count()
        return jsonify({
            "status": "success",
            "message": "Flask веб-сервис успешно подключен к базе данных PostgreSQL!",
            "database": {
                "connected": True,
                "version": result,
                "notes_in_db": notes_count
            },
            "endpoints": {
                "GET /": "Статус подключения и информация",
                "GET /health": "Проверка работоспособности (Healthcheck)",
                "GET /api/notes": "Получение списка заметок из БД",
                "POST /api/notes": "Создание новой заметки (JSON: title, content)"
            }
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": "Ошибка подключения к базе данных",
            "error": str(e)
        }), 500

# Проверка работоспособности (Healthcheck)
@app.route("/health", methods=["GET"])
def health():
    try:
        db.session.execute(text("SELECT 1"))
        return jsonify({"status": "healthy", "database": "connected"}), 200
    except Exception as e:
        return jsonify({"status": "unhealthy", "database_error": str(e)}), 503

# Получить все записи
@app.route("/api/notes", methods=["GET"])
def get_notes():
    try:
        notes = Note.query.order_by(Note.created_at.desc()).all()
        return jsonify([note.to_dict() for note in notes]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Создать новую запись в БД
@app.route("/api/notes", methods=["POST"])
def create_note():
    data = request.get_json(silent=True) or {}
    title = data.get("title", "").strip()
    content = data.get("content", "").strip()

    if not title:
        return jsonify({"error": "Поле 'title' обязательно для заполнения"}), 400

    try:
        new_note = Note(title=title, content=content)
        db.session.add(new_note)
        db.session.commit()
        return jsonify({
            "message": "Заметка успешно сохранена в PostgreSQL",
            "note": new_note.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    wait_for_db_and_create_tables()
    # Запуск сервера на 0.0.0.0 внутри контейнера
    app.run(host="0.0.0.0", port=5000, debug=os.getenv("FLASK_DEBUG", "1") == "1")
