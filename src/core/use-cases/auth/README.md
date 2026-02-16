# Auth Use Cases

Набор use-cases для авторизации и аутентификации пользователей через JWT.

## 📋 Список Use Cases

### 1. **LoginUseCase** 🔑
Аутентификация пользователя и выдача JWT токенов.

**Input:**
```typescript
{
  email: string;
  password: string;
}
```

**Output:**
```typescript
{
  accessToken: string;      // JWT токен на 15 минут
  refreshToken: string;     // Refresh токен на 7 дней
  expiresIn: number;        // Время жизни в секундах (900)
  tokenType: string;        // "Bearer"
}
```

**Логика:**
1. Поиск пользователя по email
2. Проверка пароля через `user.comparePassword()`
3. Генерация JWT токенов (access + refresh)
4. Возврат токенов клиенту

**Exceptions:**
- `UnauthorizedException` - неверный email или пароль

---

### 2. **RegisterUseCase** 📝
Регистрация нового пользователя с автоматическим логином.

**Input:**
```typescript
{
  name: string;
  email: string;
  password: string;
}
```

**Output:**
```typescript
{
  user: User;              // Созданный пользователь
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: string;
  }
}
```

**Логика:**
1. Вызов `CreateUserUseCase` (проверка уникальности email, создание)
2. Вызов `LoginUseCase` (генерация токенов)
3. Возврат пользователя + токены

**Exceptions:**
- `UserAlreadyExistsException` - email уже занят

---

### 3. **RefreshTokenUseCase** 🔄
Обновление access token через refresh token.

**Input:**
```typescript
{
  refreshToken: string;
}
```

**Output:**
```typescript
{
  accessToken: string;      // Новый access token
  refreshToken: string;     // Новый refresh token
  expiresIn: number;
  tokenType: string;
}
```

**Логика:**
1. Верификация refresh token
2. Проверка существования пользователя
3. Генерация новых токенов (access + refresh)

**Exceptions:**
- `UnauthorizedException` - невалидный refresh token

---

### 4. **ValidateUserUseCase** ✅
Валидация JWT токена и получение пользователя (используется в JwtStrategy).

**Input:**
```typescript
{
  userId: string;  // Из JWT payload
}
```

**Output:**
```typescript
User  // Доменная сущность пользователя
```

**Логика:**
1. Поиск пользователя по ID из JWT payload
2. Проверка существования
3. Опционально: проверка статуса (не заблокирован, email подтверждён и т.д.)

**Exceptions:**
- `UnauthorizedException` - пользователь не найден

---

### 5. **GetCurrentUserUseCase** 👤
Получение профиля текущего авторизованного пользователя.

**Input:**
```typescript
{
  user: User;  // Из request (после JWT валидации)
}
```

**Output:**
```typescript
User  // Текущий пользователь
```

**Логика:**
- Просто возвращает пользователя из request
- В будущем можно добавить: обновление last_seen, загрузка дополнительных данных

---

## 🔗 Взаимосвязь Use Cases

```
RegisterUseCase
    ├─> CreateUserUseCase (создание пользователя)
    └─> LoginUseCase (генерация токенов)

LoginUseCase
    └─> Генерирует JWT токены

RefreshTokenUseCase
    └─> Обновляет токены

ValidateUserUseCase
    └─> Используется в JwtStrategy

GetCurrentUserUseCase
    └─> Возвращает текущего пользователя
```

---

## 🎯 Примеры использования

### Регистрация
```typescript
const result = await registerUseCase.execute({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'SecurePass123',
});

// Результат:
{
  user: { id: 'uuid', name: 'John Doe', email: 'john@example.com' },
  tokens: {
    accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6...',
    refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6...',
    expiresIn: 900,
    tokenType: 'Bearer'
  }
}
```

### Вход
```typescript
const tokens = await loginUseCase.execute({
  email: 'john@example.com',
  password: 'SecurePass123',
});

// Использование токена:
// Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

### Обновление токена
```typescript
const newTokens = await refreshTokenUseCase.execute({
  refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6...',
});
```

---

## 🔐 JWT Payload Structure

```typescript
{
  sub: string;      // User ID
  email: string;    // User email
  name: string;     // User name
  iat: number;      // Issued at (timestamp)
  exp: number;      // Expiration time (timestamp)
}
```

---

## ⚙️ Конфигурация (.env)

```env
# JWT Access Token
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=15m

# JWT Refresh Token
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production
JWT_REFRESH_EXPIRES_IN=7d
```

---

## 🏗️ Архитектура

```
Presentation Layer (Controllers)
         ↓
    Use Cases (Business Logic)
         ↓
    Repositories (Data Access)
         ↓
    Database
```

**Композиция:**
- `RegisterUseCase` переиспользует `CreateUserUseCase` и `LoginUseCase`
- Следование принципу DRY (Don't Repeat Yourself)
- Каждый use-case отвечает за одну задачу (SRP)

---

## 📦 Зависимости

Для работы auth use-cases нужны:

1. **@nestjs/jwt** - генерация и валидация JWT
2. **@nestjs/passport** - интеграция с Passport.js
3. **passport-jwt** - JWT стратегия для Passport
4. **bcrypt** - хеширование паролей (будет в infrastructure)

```bash
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
npm install -D @types/passport-jwt @types/bcrypt
```

---

## 🚀 Следующие шаги

1. ✅ **Core layer** - Use Cases (текущий этап)
2. ⏳ **Infrastructure layer**:
   - JWT Strategy (`jwt.strategy.ts`)
   - JWT Refresh Strategy (`jwt-refresh.strategy.ts`)
   - Guards (`jwt-auth.guard.ts`)
   - Decorators (`@CurrentUser()`, `@Public()`)
3. ⏳ **Presentation layer**:
   - Auth Controller (`auth.controller.ts`)
   - DTOs (LoginDto, RegisterDto, TokenResponseDto)
4. ⏳ **Module**:
   - Auth Module (регистрация всех компонентов)
   - Глобальный JWT Guard

---

## ⚠️ Важные замечания

1. **Временная реализация**: Метод `user.comparePassword()` использует простое сравнение строк. В production нужно использовать **bcrypt** в infrastructure слое.

2. **Refresh Token**: Сейчас refresh token не сохраняется в БД. Для production рекомендуется:
   - Создать таблицу `refresh_tokens`
   - Сохранять refresh token при логине
   - Проверять существование при обновлении
   - Удалять при logout

3. **Безопасность**:
   - JWT_SECRET должен быть длинным и случайным
   - Использовать HTTPS в production
   - Регулярно ротировать секреты
   - Добавить rate limiting для /auth/login

4. **Расширения**:
   - Email verification
   - Password reset
   - Two-factor authentication (2FA)
   - OAuth providers (Google, GitHub)
   - Session management
