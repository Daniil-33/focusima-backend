# User API - Примеры запросов

## Базовый URL
```
http://localhost:3000
```

---

## 📋 Доступные эндпоинты

### 1️⃣ Создать пользователя
**POST** `/users`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**cURL:**
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securePassword123"
  }'
```

**Response (201):**
```json
{
  "id": "user_1738598234567_abc123def",
  "name": "John Doe",
  "email": "john@example.com",
  "createdAt": "2026-02-03T14:10:34.567Z",
  "updatedAt": "2026-02-03T14:10:34.567Z"
}
```

---

### 2️⃣ Получить всех пользователей
**GET** `/users`

**cURL:**
```bash
curl http://localhost:3000/users
```

**Response (200):**
```json
[
  {
    "id": "user_1738598234567_abc123def",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2026-02-03T14:10:34.567Z",
    "updatedAt": "2026-02-03T14:10:34.567Z"
  }
]
```

---

### 3️⃣ Получить пользователя по ID
**GET** `/users/:id`

**cURL:**
```bash
curl http://localhost:3000/users/user_1738598234567_abc123def
```

**Response (200):**
```json
{
  "id": "user_1738598234567_abc123def",
  "name": "John Doe",
  "email": "john@example.com",
  "createdAt": "2026-02-03T14:10:34.567Z",
  "updatedAt": "2026-02-03T14:10:34.567Z"
}
```

**Response (404) - если не найден:**
```json
{
  "statusCode": 404,
  "message": "User with identifier \"wrong_id\" not found",
  "timestamp": "2026-02-03T14:15:00.000Z"
}
```

---

### 4️⃣ Обновить пользователя
**PUT** `/users/:id`

**Request Body (все поля опциональны):**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "newSecurePassword456"
}
```

**cURL:**
```bash
curl -X PUT http://localhost:3000/users/user_1738598234567_abc123def \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe"
  }'
```

**Response (200):**
```json
{
  "id": "user_1738598234567_abc123def",
  "name": "Jane Doe",
  "email": "john@example.com",
  "createdAt": "2026-02-03T14:10:34.567Z",
  "updatedAt": "2026-02-03T14:20:00.000Z"
}
```

---

### 5️⃣ Удалить пользователя
**DELETE** `/users/:id`

**cURL:**
```bash
curl -X DELETE http://localhost:3000/users/user_1738598234567_abc123def
```

**Response (204):** *(без тела ответа)*

---

## ⚠️ Примеры ошибок валидации

### Невалидные данные при создании
**Request:**
```json
{
  "name": "J",
  "email": "invalid-email",
  "password": "123"
}
```

**Response (400):**
```json
{
  "statusCode": 400,
  "message": [
    "Name must be at least 2 characters long",
    "Invalid email format",
    "Password must be at least 8 characters long"
  ],
  "error": "Bad Request"
}
```

### Email уже существует
**Response (409):**
```json
{
  "statusCode": 409,
  "message": "User with email \"john@example.com\" already exists",
  "timestamp": "2026-02-03T14:25:00.000Z"
}
```

---

## 🧪 Тестирование в терминале

```bash
# 1. Создать пользователя
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@test.com","password":"password123"}'

# 2. Получить всех пользователей
curl http://localhost:3000/users

# 3. Создать еще одного пользователя
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Bob","email":"bob@test.com","password":"password456"}'

# 4. Обновить пользователя (замените ID)
curl -X PUT http://localhost:3000/users/REPLACE_WITH_ACTUAL_ID \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice Updated"}'

# 5. Удалить пользователя (замените ID)
curl -X DELETE http://localhost:3000/users/REPLACE_WITH_ACTUAL_ID
```
