-- Инициализация базы данных
-- Этот скрипт выполняется автоматически при первом запуске контейнера

-- Создание расширений (если нужно)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Вывод информации
SELECT 'Database initialized successfully' as status;
