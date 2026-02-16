# JWT Authentication Integration

Полная интеграция JWT авторизации в NestJS приложение.

## ✅ Что реализовано

### 📁 Структура проекта:

```
src/
├── core/
│   └── use-cases/
│       └── auth/
│           ├── login.use-case.ts
│           ├── register.use-case.ts
│           ├── refresh-token.use-case.ts
│           ├── validate-user.use-case.ts
│           └── get-current-user.use-case.ts
│
├── infrastructure/
│   └── auth/
│       ├── strategies/
│       │   ├── jwt.strategy.ts
│       │   └── jwt-refresh.strategy.ts
│       ├── guards/
│       │   ├── jwt-auth.guard.ts
│       │   └── jwt-refresh.guard.ts
│       └── decorators/
│           ├── current-user.decorator.ts
│           └── public.decorator.ts
│
├── presentation/
│   ├── controllers/
│   │   └── auth.controller.ts
│   └── dto/
│       └── auth/
│           ├── login.dto.ts
│           ├── register.dto.ts
│           ├── refresh-token.dto.ts
│           ├── token-response.dto.ts
│           └── register-response.dto.ts
│
└── modules/
    └── auth/
        └── auth.module.ts
```

---

## 🚀 API Endpoints

### **1. Регистрация**
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid-123",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2026-02-11T10:00:00.000Z",
    "updatedAt": "2026-02-11T10:00:00.000Z"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
    "expiresIn": 900,
    "tokenType": "Bearer"
  }
}
```

---

### **2. Вход**
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
  "expiresIn": 900,
  "tokenType": "Bearer"
}
```

---

### **3. Обновление токена**
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
  "expiresIn": 900,
  "tokenType": "Bearer"
}
```

---

### **4. Получение профиля**
```http
GET /auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

**Response:**
```json
{
  "id": "uuid-123",
  "name": "John Doe",
  "email": "john@example.com",
  "createdAt": "2026-02-11T10:00:00.000Z",
  "updatedAt": "2026-02-11T10:00:00.000Z"
}
```

---

## 🔐 Использование в контроллерах

### **Защищённый эндпоинт (по умолчанию)**

Все эндпоинты защищены JWT по умолчанию благодаря глобальному `JwtAuthGuard`:

```typescript
@Controller('users')
export class UserController {
    @Get()
    async findAll(@CurrentUser() user: User) {
        // user автоматически извлекается из JWT токена
        console.log('Current user:', user.id, user.email);
        return this.usersService.findAll();
    }

    @Post()
    async create(
        @Body() dto: CreateUserDto,
        @CurrentUser() user: User
    ) {
        // Используем user.id как createdBy
        return this.createUserUseCase.execute({
            ...dto,
            createdBy: user.id,
        });
    }
}
```

---

### **Публичный эндпоинт**

Используйте декоратор `@Public()` для эндпоинтов без JWT:

```typescript
@Controller('public')
export class PublicController {
    @Public()
    @Get('health')
    async healthCheck() {
        return { status: 'ok' };
    }

    @Public()
    @Get('version')
    async getVersion() {
        return { version: '1.0.0' };
    }
}
```

---

### **Извлечение текущего пользователя**

```typescript
import { CurrentUser } from '../../infrastructure/auth/decorators/current-user.decorator';
import { User } from '../../core/entities/user.entity';

@Controller('profile')
export class ProfileController {
    @Get()
    async getProfile(@CurrentUser() user: User) {
        // user - это доменная сущность User из JWT
        return {
            id: user.id,
            name: user.name,
            email: user.email,
        };
    }

    @Put()
    async updateProfile(
        @Body() dto: UpdateProfileDto,
        @CurrentUser() user: User
    ) {
        return this.updateProfileUseCase.execute({
            userId: user.id,
            ...dto,
        });
    }
}
```

---

## 🔒 JWT Payload Structure

```typescript
{
  sub: string;      // User ID (subject)
  email: string;    // User email
  name: string;     // User name
  iat: number;      // Issued at (timestamp)
  exp: number;      // Expiration time (timestamp)
}
```

---

## ⚙️ Конфигурация

### **.env файл**

```env
# JWT Access Token (короткоживущий)
JWT_SECRET=your-super-secret-key-change-in-production-focusima-2026
JWT_EXPIRES_IN=15m

# JWT Refresh Token (долгоживущий)
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production-focusima-2026
JWT_REFRESH_EXPIRES_IN=7d
```

### **Безопасность:**
- ✅ Используйте длинные случайные строки для секретов (минимум 32 символа)
- ✅ Разные секреты для access и refresh токенов
- ✅ HTTPS обязателен в production
- ✅ Храните секреты в безопасных местах (AWS Secrets Manager, HashiCorp Vault)

---

## 🛡️ Глобальный JWT Guard

В `app.module.ts` настроен глобальный guard:

```typescript
providers: [
    {
        provide: APP_GUARD,
        useClass: JwtAuthGuard,
    },
]
```

**Это означает:**
- ✅ Все эндпоинты защищены JWT по умолчанию
- ✅ Не нужно добавлять `@UseGuards(JwtAuthGuard)` к каждому контроллеру
- ✅ Используйте `@Public()` только для публичных эндпоинтов

---

## 🔄 Flow авторизации

### **1. Регистрация + Автологин:**
```
Client → POST /auth/register
         ↓
    RegisterUseCase
         ├─> CreateUserUseCase (создание пользователя)
         └─> LoginUseCase (генерация JWT)
         ↓
    Tokens (access + refresh)
```

### **2. Вход:**
```
Client → POST /auth/login
         ↓
    LoginUseCase
         ├─> Поиск пользователя
         ├─> Проверка пароля
         └─> Генерация JWT
         ↓
    Tokens (access + refresh)
```

### **3. Защищённый запрос:**
```
Client → GET /users (Authorization: Bearer token)
         ↓
    JwtAuthGuard
         ↓
    JwtStrategy.validate()
         ├─> Верификация токена
         ├─> ValidateUserUseCase
         └─> Добавление user в request
         ↓
    UserController.findAll()
         ↓
    @CurrentUser() user ← Извлечение из request
```

### **4. Обновление токена:**
```
Client → POST /auth/refresh (refreshToken)
         ↓
    RefreshTokenUseCase
         ├─> Верификация refresh token
         ├─> Проверка пользователя
         └─> Генерация новых токенов
         ↓
    New Tokens (access + refresh)
```

---

## 📦 Установленные пакеты

```json
{
  "dependencies": {
    "@nestjs/jwt": "^10.x",
    "@nestjs/passport": "^10.x",
    "passport": "^0.7.x",
    "passport-jwt": "^4.x",
    "bcrypt": "^5.x"
  },
  "devDependencies": {
    "@types/passport-jwt": "^4.x",
    "@types/bcrypt": "^5.x"
  }
}
```

---

## 🧪 Тестирование

### **С помощью curl:**

```bash
# 1. Регистрация
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'

# 2. Вход
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# 3. Защищённый запрос
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# 4. Обновление токена
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

---

## ⚠️ Важные замечания

### **1. Хеширование паролей**
Сейчас используется mock `hashed_${password}`.

**TODO для production:**
```typescript
// В User entity или отдельном сервисе
import * as bcrypt from 'bcrypt';

async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
}

async comparePassword(plainPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, this._passwordHash);
}
```

### **2. Refresh Token в БД**
Рекомендуется хранить refresh токены в БД для:
- Отзыва токенов (logout)
- Отслеживания активных сессий
- Безопасности

**TODO:** Создать таблицу `refresh_tokens`:
```sql
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    token TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### **3. Rate Limiting**
Добавьте rate limiting для защиты от brute-force:
```bash
npm install @nestjs/throttler
```

### **4. Email Verification**
Рекомендуется добавить подтверждение email перед полным доступом.

---

## 🎯 Следующие шаги

1. ✅ **Запустить приложение:**
   ```bash
   npm run start:dev
   ```

2. ✅ **Протестировать эндпоинты** (см. раздел Тестирование)

3. ⏳ **Добавить bcrypt для паролей** (production)

4. ⏳ **Реализовать refresh tokens в БД**

5. ⏳ **Добавить rate limiting**

6. ⏳ **Добавить email verification**

7. ⏳ **Добавить 2FA (опционально)**

---

## 🐛 Troubleshooting

### **"Invalid or expired token"**
- Проверьте, что токен передаётся в header `Authorization: Bearer TOKEN`
- Проверьте срок действия токена (15 минут для access)
- Используйте refresh token для получения нового access token

### **"User not found"**
- Пользователь был удалён из БД
- Неверный user ID в JWT payload

### **"Cannot find module '@nestjs/jwt'"**
- Выполните: `npm install`
- Перезапустите приложение

---

## 📚 Полезные ссылки

- [NestJS JWT Documentation](https://docs.nestjs.com/security/authentication#jwt-token)
- [Passport JWT Strategy](http://www.passportjs.org/packages/passport-jwt/)
- [JWT.io](https://jwt.io/) - для отладки токенов

---

**Готово! JWT авторизация полностью интегрирована! 🎉**
