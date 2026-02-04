# Makefile для упрощения работы с проектом

.PHONY: help install dev build lint format test db-migrate db-revert db-psql

# Показать помощь по командам
help:
	@echo "📚 Доступные команды:"
	@echo ""
	@echo "  make install      - Установить зависимости"
	@echo "  make dev          - Запустить в режиме разработки"
	@echo "  make build        - Собрать проект"
	@echo "  make lint         - Проверить код (ESLint)"
	@echo "  make format       - Форматировать код (Prettier)"
	@echo "  make test         - Запустить тесты"
	@echo ""
	@echo "🗄️  База данных (через SSH туннель):"
	@echo "  make db-migrate   - Применить миграции"
	@echo "  make db-revert    - Откатить миграцию"
	@echo "  make db-psql      - Подключиться к БД через psql"
	@echo "  make db-check     - Проверить подключение к БД"
	@echo ""

# Установить зависимости
install:
	npm install

# Запустить в режиме разработки
dev:
	npm run start:dev

# Собрать проект
build:
	npm run build

# Линтинг
lint:
	npm run lint

# Форматирование
format:
	npm run format

# Тесты
test:
	npm run test

# Применить миграции
db-migrate:
	npm run migration:run

# Откатить миграцию
db-revert:
	npm run migration:revert

# Подключиться к PostgreSQL через SSH туннель
db-psql:
	psql -h localhost -p 15432 -U focusima_dev_admin -d focusima_dev

# Проверить подключение к БД
db-check:
	@echo "Проверка подключения к БД..."
	@psql -h localhost -p 15432 -U focusima_dev_admin -d focusima_dev -c "SELECT version();" > /dev/null 2>&1 && echo "✅ Подключение к БД успешно!" || echo "❌ Ошибка подключения к БД"

# Полная настройка проекта
setup: install
	@echo "✅ Проект готов к работе!"
	@echo ""
	@echo "⚠️  Не забудьте:"
	@echo "  1. Создать SSH туннель: ssh -f -N -L 15432:localhost:5432 user@server.com"
	@echo "  2. Проверить .env файл"
	@echo "  3. Запустить миграции: make db-migrate"
	@echo ""
	@echo "Затем запустите: make dev"
