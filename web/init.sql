-- Скрипт начальной инициализации базы данных PostgreSQL (выполняется один раз при первом создании тома БД)
CREATE TABLE IF NOT EXISTS notes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    content TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Тестовые начальные данные
INSERT INTO notes (title, content) VALUES
('Первая запись', 'База данных PostgreSQL успешно инициализирована через Docker Compose.'),
('Связь настроена', 'Веб-сервис Flask взаимодействует с базой по внутренней сети app_network.');
