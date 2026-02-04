# 🐘 PostgreSQL Integration Guide

## 📦 Установленные пакеты

```bash
npm install @nestjs/typeorm @nestjs/config typeorm pg
```

---

## 🚀 Быстрый старт

### 1️⃣ Запустить PostgreSQL локально (Docker)

```bash
# Запустить PostgreSQL + pgAdmin
docker-compose up -d

# Проверить статус
docker-compose ps

# Остановить
docker-compose down

# Остановить и удалить данные
docker-compose down -v
```

**Доступы:**
- **PostgreSQL**: `localhost:5432`
  - User: `postgres`
  - Password: `postgres`
  - Database: `focusima_dev`

- **pgAdmin** (опционально): `http://localhost:5050`
  - Email: `admin@focusima.com`
  - Password: `admin`

---

### 2️⃣ Применить миграции

```bash
# Запустить миграции
npm run migration:run

# Откатить последнюю миграцию
npm run migration:revert
```

---

### 3️⃣ Запустить приложение

```bash
npm run start:dev
```

Приложение автоматически подключится к локальной БД!

---

## 🔧 Конфигурация

### Локальная разработка (`.env`)
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=focusima_dev
DB_SYNCHRONIZE=false
DB_LOGGING=true
DB_MIGRATIONS_RUN=true
```

### Подключение к удаленной БД
Просто измените переменные в `.env`:
```env
DB_HOST=your-remote-host.com
DB_PORT=5432
DB_USERNAME=your-username
DB_PASSWORD=your-secure-password
DB_DATABASE=your-database
DB_SYNCHRONIZE=false
DB_LOGGING=false
DB_MIGRATIONS_RUN=true
```

---

## 🗄️ Работа с миграциями

### Создать новую миграцию (автогенерация из entities)
```bash
npm run migration:generate -- src/infrastructure/database/migrations/AddNewColumn
```

### Создать пустую миграцию
```bash
npm run migration:create -- src/infrastructure/database/migrations/CustomMigration
```

### Запустить миграции
```bash
npm run migration:run
```

### Откатить миграцию
```bash
npm run migration:revert
```

### Синхронизировать схему (⚠️ только для разработки!)
```bash
npm run schema:sync
```

### Удалить всю схему (⚠️ опасно!)
```bash
npm run schema:drop
```

---

## 📁 Структура БД

```
src/infrastructure/database/
├── entities/                      # TypeORM сущности
│   └── user.orm-entity.ts         # @Entity декораторы
├── repositories/                  # Реализации репозиториев
│   └── typeorm-user.repository.ts # Работа с TypeORM
├── mappers/                       # Конвертация ORM ↔ Domain
│   └── user.mapper.ts             # Mapper для User
├── migrations/                    # SQL миграции
│   └── 1738598400000-CreateUsersTable.ts
└── seeds/                         # Seed данные (опционально)
```

---

## 🔄 Поток данных

```
Controller (DTO)
    ↓
Use Case (Domain Entity)
    ↓
Repository Interface (IUserRepository)
    ↓
TypeORM Repository Implementation
    ↓
Mapper: Domain Entity ↔ ORM Entity
    ↓
TypeORM (ORM Entity)
    ↓
PostgreSQL Database
```

---

## 🎯 Clean Architecture с TypeORM

### Domain Entity (Core)
```typescript
// src/core/entities/user.entity.ts
export class User {
    private readonly _id: string;
    private _name: string;
    // Бизнес-логика, валидация
}
```

### ORM Entity (Infrastructure)
```typescript
// src/infrastructure/database/entities/user.orm-entity.ts
@Entity('users')
export class UserOrmEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    
    @Column()
    name: string;
    // TypeORM декораторы
}
```

### Mapper (Infrastructure)
```typescript
// src/infrastructure/database/mappers/user.mapper.ts
export class UserMapper {
    static toDomain(orm: UserOrmEntity): User { ... }
    static toOrm(domain: User): UserOrmEntity { ... }
}
```

### Repository (Infrastructure)
```typescript
// src/infrastructure/database/repositories/typeorm-user.repository.ts
@Injectable()
export class TypeOrmUserRepository implements IUserRepository {
    constructor(
        @InjectRepository(UserOrmEntity)
        private repository: Repository<UserOrmEntity>
    ) {}
    
    async create(user: User): Promise<User> {
        const orm = UserMapper.toOrm(user);
        const saved = await this.repository.save(orm);
        return UserMapper.toDomain(saved);
    }
}
```

---

## 🧪 Тестирование БД

### Подключение к БД через psql
```bash
docker exec -it focusima-postgres psql -U postgres -d focusima_dev
```

### SQL команды
```sql
-- Посмотреть таблицы
\dt

-- Посмотреть структуру таблицы users
\d users

-- Выбрать всех пользователей
SELECT * FROM users;

-- Выйти
\q
```

---

## 🔒 Безопасность

### ⚠️ НЕ коммитить `.env` файл!
Добавьте в `.gitignore`:
```
.env
.env.local
.env.*.local
```

### ✅ Использовать `.env.example`
Шаблон для других разработчиков:
```bash
cp .env.example .env
# Затем заполните реальные данные
```

---

## 📊 Monitoring (pgAdmin)

1. Откройте http://localhost:5050
2. Войдите: `admin@focusima.com` / `admin`
3. Add New Server:
   - Name: `Focusima Local`
   - Host: `postgres` (имя сервиса из docker-compose)
   - Port: `5432`
   - Username: `postgres`
   - Password: `postgres`

---

## 🐳 Docker команды

```bash
# Запустить только PostgreSQL (без pgAdmin)
docker-compose up -d postgres

# Посмотреть логи
docker-compose logs -f postgres

# Перезапустить
docker-compose restart postgres

# Войти в контейнер
docker exec -it focusima-postgres bash

# Бэкап БД
docker exec focusima-postgres pg_dump -U postgres focusima_dev > backup.sql

# Восстановление БД
docker exec -i focusima-postgres psql -U postgres focusima_dev < backup.sql
```

---

## 🚨 Troubleshooting

### Порт 5432 уже занят
```bash
# Найти процесс
lsof -i :5432

# Остановить PostgreSQL на macOS
brew services stop postgresql

# Или изменить порт в docker-compose.yml
ports:
  - '5433:5432'  # внешний:внутренний
```

### Ошибка подключения
```bash
# Проверить, что контейнер запущен
docker-compose ps

# Проверить логи
docker-compose logs postgres

# Пересоздать контейнер
docker-compose down
docker-compose up -d
```

### Миграции не применяются
```bash
# Проверить .env файл
cat .env | grep DB_

# Запустить миграции вручную
npm run migration:run

# Проверить таблицу migrations
docker exec -it focusima-postgres psql -U postgres -d focusima_dev -c "SELECT * FROM migrations;"
```

---

## 📚 Дополнительные ресурсы

- [TypeORM Documentation](https://typeorm.io/)
- [NestJS Database Guide](https://docs.nestjs.com/techniques/database)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Compose](https://docs.docker.com/compose/)

---

## ✅ Чеклист готовности

- [ ] PostgreSQL запущен (`docker-compose up -d`)
- [ ] `.env` файл создан и заполнен
- [ ] Миграции применены (`npm run migration:run`)
- [ ] Приложение запущено (`npm run start:dev`)
- [ ] API работает (создать пользователя через POST /users)
- [ ] Данные сохраняются в БД (проверить в pgAdmin или psql)

🎉 **Готово! PostgreSQL интегрирован!**
