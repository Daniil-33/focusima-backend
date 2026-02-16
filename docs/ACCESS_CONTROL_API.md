# Access Control REST API Documentation

## 📋 Обзор

Полный CRUD API для управления правилами доступа (Access Rules) с поддержкой JWT аутентификации.

**Base URL:** `http://localhost:3000/access-control`

---

## 🔐 Аутентификация

Все эндпоинты (кроме `/auth/*`) защищены JWT токеном:

```http
Authorization: Bearer <JWT_TOKEN>
```

---

## 📌 Эндпоинты

### 1. **POST** `/rules` - Создать правило

Создаёт новое правило доступа для текущего пользователя.

**Request:**
```http
POST /access-control/rules
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Block Russian Sites",
  "description": "Block all .ru domains for productivity",
  "effect": "block",
  "condition": {
    "type": "Regex",
    "data": {
      "pattern": "^.*\\.ru$"
    }
  }
}
```

**Response:** `201 Created`
```json
{
  "message": "Access rule created successfully",
  "rule": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Block Russian Sites",
    "description": "Block all .ru domains for productivity",
    "effect": "block",
    "condition": {
      "type": "Regex",
      "data": {
        "pattern": "^.*\\.ru$"
      }
    },
    "createdByUserId": "user-uuid",
    "createdAt": "2026-02-16T10:00:00.000Z",
    "updatedAt": "2026-02-16T10:00:00.000Z"
  }
}
```

---

### 2. **GET** `/rules` - Получить все правила

Возвращает все правила, созданные текущим пользователем.

**Request:**
```http
GET /access-control/rules
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
[
  {
    "id": "rule-id-1",
    "name": "Allow Social Media",
    "description": "Allow access to social networks",
    "effect": "allow",
    "condition": {
      "type": "List",
      "data": {
        "values": ["facebook.com", "twitter.com", "instagram.com"]
      }
    },
    "createdByUserId": "user-uuid",
    "createdAt": "2026-02-15T10:00:00.000Z",
    "updatedAt": "2026-02-15T10:00:00.000Z"
  },
  {
    "id": "rule-id-2",
    "name": "Block Gaming Sites",
    "description": "Block gaming websites during work hours",
    "effect": "block",
    "condition": {
      "type": "Regex",
      "data": {
        "pattern": "^.*(steam|epicgames|twitch)\\..*$"
      }
    },
    "createdByUserId": "user-uuid",
    "createdAt": "2026-02-16T08:00:00.000Z",
    "updatedAt": "2026-02-16T08:00:00.000Z"
  }
]
```

---

### 3. **GET** `/rules/:id` - Получить правило по ID

Возвращает конкретное правило.

**Request:**
```http
GET /access-control/rules/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Block Russian Sites",
  "description": "Block all .ru domains",
  "effect": "block",
  "condition": {
    "type": "Regex",
    "data": {
      "pattern": "^.*\\.ru$"
    }
  },
  "createdByUserId": "user-uuid",
  "createdAt": "2026-02-16T10:00:00.000Z",
  "updatedAt": "2026-02-16T10:00:00.000Z"
}
```

**Errors:**
- `404 Not Found` - Правило не найдено

---

### 4. **PUT** `/rules/:id` - Обновить правило

Обновляет существующее правило (частичное обновление).

**Request:**
```http
PUT /access-control/rules/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer <token>
Content-Type: application/json

{
  "description": "Updated description",
  "condition": {
    "type": "List",
    "data": {
      "values": ["yandex.ru", "mail.ru"]
    }
  }
}
```

**Response:** `200 OK`
```json
{
  "message": "Access rule updated successfully",
  "rule": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Block Russian Sites",
    "description": "Updated description",
    "effect": "block",
    "condition": {
      "type": "List",
      "data": {
        "values": ["yandex.ru", "mail.ru"]
      }
    },
    "createdByUserId": "user-uuid",
    "createdAt": "2026-02-16T10:00:00.000Z",
    "updatedAt": "2026-02-16T11:30:00.000Z"
  }
}
```

---

### 5. **DELETE** `/rules/:id` - Удалить правило

Удаляет правило и все его состояния (CASCADE).

**Request:**
```http
DELETE /access-control/rules/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "message": "Access rule deleted successfully"
}
```

---

### 6. **PUT** `/rules/:id/enable` - Включить правило

Включает правило для текущего пользователя (User scope).

**Request:**
```http
PUT /access-control/rules/123e4567-e89b-12d3-a456-426614174000/enable
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "message": "Access rule enabled successfully",
  "state": {
    "id": "state-uuid",
    "ruleId": "123e4567-e89b-12d3-a456-426614174000",
    "scopeType": "User",
    "scopeId": "user-uuid",
    "isEnabled": true,
    "createdAt": "2026-02-16T10:00:00.000Z",
    "updatedAt": "2026-02-16T12:00:00.000Z"
  }
}
```

---

### 7. **PUT** `/rules/:id/disable` - Выключить правило

Отключает правило для текущего пользователя.

**Request:**
```http
PUT /access-control/rules/123e4567-e89b-12d3-a456-426614174000/disable
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "message": "Access rule disabled successfully",
  "state": {
    "id": "state-uuid",
    "ruleId": "123e4567-e89b-12d3-a456-426614174000",
    "scopeType": "User",
    "scopeId": "user-uuid",
    "isEnabled": false,
    "createdAt": "2026-02-16T10:00:00.000Z",
    "updatedAt": "2026-02-16T12:15:00.000Z"
  }
}
```

---

### 8. **GET** `/rules/user/:userId/enabled` - Получить включенные правила пользователя

Возвращает все активные правила для пользователя.

**Request:**
```http
GET /access-control/rules/user/user-uuid/enabled
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
[
  {
    "id": "rule-id-1",
    "name": "Block Social Media",
    "description": "Block social networks during work",
    "effect": "block",
    "condition": {
      "type": "List",
      "data": {
        "values": ["facebook.com", "twitter.com"]
      }
    },
    "createdByUserId": "user-uuid",
    "createdAt": "2026-02-15T10:00:00.000Z",
    "updatedAt": "2026-02-15T10:00:00.000Z"
  }
]
```

---

### 9. **GET** `/rules/:id/states` - Получить состояния правила

Возвращает все состояния правила (для разных scopes).

**Request:**
```http
GET /access-control/rules/123e4567-e89b-12d3-a456-426614174000/states
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
[
  {
    "id": "state-1",
    "ruleId": "123e4567-e89b-12d3-a456-426614174000",
    "scopeType": "User",
    "scopeId": "user-uuid-1",
    "isEnabled": true,
    "createdAt": "2026-02-16T10:00:00.000Z",
    "updatedAt": "2026-02-16T10:00:00.000Z"
  },
  {
    "id": "state-2",
    "ruleId": "123e4567-e89b-12d3-a456-426614174000",
    "scopeType": "User",
    "scopeId": "user-uuid-2",
    "isEnabled": false,
    "createdAt": "2026-02-16T11:00:00.000Z",
    "updatedAt": "2026-02-16T11:00:00.000Z"
  }
]
```

---

## 📝 Типы данных

### Condition Types

#### List Condition
```json
{
  "type": "List",
  "data": {
    "values": ["site1.com", "site2.com", "site3.com"]
  }
}
```

#### Regex Condition
```json
{
  "type": "Regex",
  "data": {
    "pattern": "^.*\\.(ru|ua|by)$"
  }
}
```

### Effect Types
- `"allow"` - Разрешить доступ
- `"block"` - Заблокировать доступ

### Scope Types
- `"User"` - Правило применяется к конкретному пользователю
- `"Group"` - Правило применяется к группе (будущая функциональность)
- `"Global"` - Правило применяется глобально (будущая функциональность)

---

## 🧪 Примеры использования

### Сценарий 1: Блокировка сайтов по списку

```bash
# 1. Создать правило
curl -X POST http://localhost:3000/access-control/rules \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Block Distractions",
    "description": "Block distracting websites",
    "effect": "block",
    "condition": {
      "type": "List",
      "data": {
        "values": ["reddit.com", "9gag.com", "tiktok.com"]
      }
    }
  }'

# 2. Включить правило
RULE_ID="<rule-id-from-response>"
curl -X PUT http://localhost:3000/access-control/rules/$RULE_ID/enable \
  -H "Authorization: Bearer $TOKEN"
```

### Сценарий 2: Блокировка по regex паттерну

```bash
# Блокировать все поддомены Google
curl -X POST http://localhost:3000/access-control/rules \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Block Google Services",
    "description": "Block all Google subdomains",
    "effect": "block",
    "condition": {
      "type": "Regex",
      "data": {
        "pattern": "^.*\\.google\\.com$"
      }
    }
  }'
```

### Сценарий 3: Обновление правила

```bash
# Изменить описание и добавить сайты в список
curl -X PUT http://localhost:3000/access-control/rules/$RULE_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Updated list of blocked sites",
    "condition": {
      "type": "List",
      "data": {
        "values": ["reddit.com", "9gag.com", "tiktok.com", "youtube.com"]
      }
    }
  }'
```

---

## ⚠️ Коды ошибок

| Код | Описание |
|-----|----------|
| `400 Bad Request` | Невалидные данные (валидация DTO не прошла) |
| `401 Unauthorized` | Отсутствует или невалидный JWT токен |
| `404 Not Found` | Правило не найдено |
| `409 Conflict` | Правило с таким именем уже существует |
| `500 Internal Server Error` | Внутренняя ошибка сервера |

---

## 🔒 Безопасность

1. **JWT токен обязателен** для всех эндпоинтов
2. **User ID берётся из токена** - пользователь не может подделать `createdByUserId`
3. **Cascade delete** - при удалении правила удаляются все его состояния
4. **Валидация на уровне DTO** - некорректные данные отклоняются до бизнес-логики

---

## 🧪 Тестирование с curl

```bash
# 1. Получить JWT токен
TOKEN=$(curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}' \
  | jq -r '.accessToken')

# 2. Создать правило
RESPONSE=$(curl -X POST http://localhost:3000/access-control/rules \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Rule",
    "description": "Test description",
    "effect": "block",
    "condition": {
      "type": "List",
      "data": {"values": ["test.com"]}
    }
  }')

# 3. Извлечь ID правила
RULE_ID=$(echo $RESPONSE | jq -r '.rule.id')

# 4. Получить правило
curl -X GET http://localhost:3000/access-control/rules/$RULE_ID \
  -H "Authorization: Bearer $TOKEN"

# 5. Включить правило
curl -X PUT http://localhost:3000/access-control/rules/$RULE_ID/enable \
  -H "Authorization: Bearer $TOKEN"

# 6. Получить все правила
curl -X GET http://localhost:3000/access-control/rules \
  -H "Authorization: Bearer $TOKEN"

# 7. Выключить правило
curl -X PUT http://localhost:3000/access-control/rules/$RULE_ID/disable \
  -H "Authorization: Bearer $TOKEN"

# 8. Удалить правило
curl -X DELETE http://localhost:3000/access-control/rules/$RULE_ID \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📚 Дополнительные ресурсы

- [JWT Authentication Guide](./JWT_AUTHENTICATION.md)
- [Access Control Infrastructure](./ACCESS_CONTROL_INFRASTRUCTURE.md)
- [Factory Pattern Refactoring](./REFACTORING_FACTORY_PATTERN.md)
