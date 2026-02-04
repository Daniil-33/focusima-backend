# 📖 Архитектура проекта

## 🏗️ Структура проекта (Clean Architecture)

```
src/
├── core/                           # 🎯 DOMAIN LAYER (ядро, бизнес-логика)
│   ├── entities/                   # Бизнес-сущности
│   │   └── user.entity.ts          # Domain модель User
│   ├── repositories/               # Интерфейсы репозиториев (Ports)
│   │   └── user.repository.interface.ts
│   ├── use-cases/                  # Бизнес-логика приложения
│   │   └── user/
│   │       ├── create-user.use-case.ts
│   │       ├── get-user.use-case.ts
│   │       ├── get-all-users.use-case.ts
│   │       ├── update-user.use-case.ts
│   │       └── delete-user.use-case.ts
│   └── exceptions/                 # Доменные исключения
│       ├── user-not-found.exception.ts
│       └── user-already-exists.exception.ts
│
├── infrastructure/                 # 🔧 INFRASTRUCTURE LAYER (внешние зависимости)
│   └── database/
│       └── repositories/
│           └── user.repository.ts  # Реализация IUserRepository (in-memory)
│
├── presentation/                   # 🌐 PRESENTATION LAYER (API)
│   ├── controllers/
│   │   └── user.controller.ts      # REST API endpoints
│   ├── dto/
│   │   └── user/
│   │       ├── create-user.dto.ts  # Валидация входных данных
│   │       ├── update-user.dto.ts
│   │       └── user-response.dto.ts # Формат ответа (без password)
│   └── filters/
│       └── http-exception.filter.ts # Обработка ошибок
│
├── modules/                        # 📦 FEATURE MODULES
│   └── user/
│       └── user.module.ts          # Связывает всё вместе
│
├── app.module.ts                   # Корневой модуль
└── main.ts                         # Точка входа
```

---

## 🔄 Поток данных (Data Flow)

```
HTTP Request (POST /users)
    ↓
UserController (presentation)
    ↓ (валидация CreateUserDto)
    ↓
CreateUserUseCase (core)
    ↓ (бизнес-логика)
    ↓
UserRepository Interface (core) ← контракт
    ↓
UserRepository Implementation (infrastructure)
    ↓ (сохранение в БД / in-memory)
    ↓
User Entity (core) ← доменная модель
    ↓
UserResponseDto (presentation) ← без пароля!
    ↓
HTTP Response (JSON)
```

---

## 🎯 Принципы Clean Architecture

### 1. **Зависимости направлены внутрь**
- ✅ `Infrastructure` → `Core`
- ✅ `Presentation` → `Core`
- ❌ `Core` НЕ зависит от внешних слоёв

### 2. **Инверсия зависимостей (Dependency Inversion)**
- `Core` определяет интерфейсы (IUserRepository)
- `Infrastructure` их реализует (UserRepository)
- Легко заменить реализацию без изменения бизнес-логики

### 3. **Разделение ответственности**
- **Entity**: бизнес-правила и валидация
- **Use Case**: бизнес-логика приложения
- **Repository**: работа с данными
- **Controller**: обработка HTTP запросов
- **DTO**: валидация и трансформация данных

---

## 🧩 Компоненты приложения

### **User Entity** (Domain Model)
```typescript
// src/core/entities/user.entity.ts
- Чистая бизнес-модель
- Содержит бизнес-правила (валидация email, длина пароля)
- Имеет методы: updateName(), updateEmail(), updatePassword()
- НЕ зависит от фреймворков
```

### **IUserRepository** (Port/Interface)
```typescript
// src/core/repositories/user.repository.interface.ts
- Определяет контракт для работы с данными
- create(), findById(), findByEmail(), findAll(), update(), delete()
- Используется в Use Cases
```

### **Use Cases** (Application Logic)
```typescript
// src/core/use-cases/user/
- CreateUserUseCase: проверяет дубликаты, создаёт пользователя
- GetUserUseCase: получает по ID, выбрасывает исключение если не найден
- GetAllUsersUseCase: получает список
- UpdateUserUseCase: обновляет с проверками
- DeleteUserUseCase: удаляет
```

### **UserRepository** (Implementation)
```typescript
// src/infrastructure/database/repositories/user.repository.ts
- Реализует IUserRepository
- In-memory хранилище (Map)
- В реальном приложении: TypeORM / Prisma / MongoDB
```

### **DTOs** (Data Transfer Objects)
```typescript
// src/presentation/dto/user/
- CreateUserDto: валидация входных данных
- UpdateUserDto: частичное обновление
- UserResponseDto: ответ БЕЗ пароля
```

### **UserController** (API Endpoints)
```typescript
// src/presentation/controllers/user.controller.ts
- POST   /users      → создать
- GET    /users      → получить всех
- GET    /users/:id  → получить одного
- PUT    /users/:id  → обновить
- DELETE /users/:id  → удалить
```

### **HttpExceptionFilter** (Error Handling)
```typescript
// src/presentation/filters/http-exception.filter.ts
- Перехватывает все исключения
- Преобразует доменные исключения в HTTP ответы:
  - UserNotFoundException → 404
  - UserAlreadyExistsException → 409
  - Validation errors → 400
```

---

## 🔌 Dependency Injection

```typescript
// UserModule связывает всё вместе
@Module({
  controllers: [UserController],
  providers: [
    // Регистрируем реализацию репозитория
    {
      provide: USER_REPOSITORY,  // токен
      useClass: UserRepository,   // реализация
    },
    // Use Cases
    CreateUserUseCase,
    GetUserUseCase,
    // ...
  ],
})
```

---

## 🧪 Преимущества такой архитектуры

### ✅ **Тестируемость**
```typescript
// Легко мокировать репозиторий для тестов
const mockRepository: IUserRepository = {
  create: jest.fn(),
  findById: jest.fn(),
  // ...
};

const useCase = new CreateUserUseCase(mockRepository);
```

### ✅ **Независимость от фреймворка**
- Бизнес-логика в `core/` не зависит от NestJS
- Можно переиспользовать в другом фреймворке

### ✅ **Замена реализации**
```typescript
// Легко заменить in-memory на TypeORM
{
  provide: USER_REPOSITORY,
  useClass: TypeOrmUserRepository, // вместо UserRepository
}
```

### ✅ **Читаемость**
- Каждый файл имеет одну ответственность
- Легко найти где находится логика

---

## 🚀 Следующие шаги

1. **Добавить реальную БД**: TypeORM, Prisma, Mongoose
2. **Хеширование паролей**: bcrypt
3. **Аутентификация**: JWT, Passport
4. **Swagger документация**: @nestjs/swagger
5. **Тесты**: Unit tests + E2E tests
6. **Логирование**: Winston, Pino
7. **Валидация окружения**: @nestjs/config
8. **Docker**: Контейнеризация

---

## 📚 Дополнительные ресурсы

- [NestJS Documentation](https://docs.nestjs.com/)
- [Clean Architecture (Uncle Bob)](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
