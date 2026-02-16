# Access Control Use Cases

Набор use-cases для управления правилами доступа в системе Focusima.

## 📋 Список Use Cases

### 1. **CreateAccessRuleUseCase**
Создание нового правила доступа с автоматическим созданием начального состояния.

**Input:**
- `userId` - ID пользователя-создателя
- `name` - Название правила
- `description` - Описание правила
- `condition` - Условие для проверки (List или Regex)

**Output:** `AccessRule`

**Логика:**
- Проверяет уникальность имени правила
- Создаёт правило и начальное состояние в транзакции
- Состояние создаётся для пользователя в выключенном виде

---

### 2. **GetAccessRuleUseCase**
Получение правила доступа по ID.

**Input:**
- `ruleId` - ID правила

**Output:** `AccessRule`

**Exceptions:**
- `AccessRuleNotFoundException` - если правило не найдено

---

### 3. **GetAllAccessRulesUseCase**
Получение всех правил доступа с опциональной фильтрацией.

**Input:**
- `userId` (optional) - Фильтр по создателю

**Output:** `AccessRule[]`

---

### 4. **UpdateAccessRuleUseCase**
Обновление существующего правила доступа.

**Input:**
- `ruleId` - ID правила
- `userId` - ID пользователя, который обновляет
- `name` (optional) - Новое название
- `description` (optional) - Новое описание
- `condition` (optional) - Новое условие

**Output:** `AccessRule`

**Логика:**
- Обновляет только переданные поля
- Автоматически обновляет `updatedAt` и `updatedBy`

---

### 5. **DeleteAccessRuleUseCase**
Удаление правила доступа.

**Input:**
- `ruleId` - ID правила
- `userId` - ID пользователя для проверки прав

**Output:** `void`

**Логика:**
- Каскадно удаляет все связанные состояния (благодаря FK)

---

### 6. **EnableAccessRuleUseCase**
Включение правила доступа для определённого scope.

**Input:**
- `ruleId` - ID правила
- `scope` - Scope применения (User, Group, Global)
- `userId` - ID пользователя, который включает

**Output:** `AccessRuleState`

**Логика:**
- Проверяет существование правила
- Создаёт новое состояние или обновляет существующее
- Предотвращает дублирование включённых состояний

**Exceptions:**
- `AccessRuleNotFoundException`
- `AccessRuleAlreadyEnabledException`

---

### 7. **DisableAccessRuleUseCase**
Отключение правила доступа для определённого scope.

**Input:**
- `ruleId` - ID правила
- `scope` - Scope применения
- `userId` - ID пользователя, который отключает

**Output:** `AccessRuleState`

**Exceptions:**
- `AccessRuleNotFoundException`
- `AccessRuleStateNotFoundException`

---

### 8. **GetEnabledRulesForUserUseCase**
Получение всех включенных правил для пользователя.

**Input:**
- `userId` - ID пользователя

**Output:** `AccessRule[]`

**Логика:**
- Получает правила для пользователя (User scope)
- Добавляет глобальные правила (Global scope)
- Убирает дубликаты

---

### 9. **CheckAccessUseCase** 🔐
Проверка доступа к ресурсу для пользователя.

**Input:**
- `userId` - ID пользователя
- `resourceUrl` - URL или домен ресурса

**Output:** `CheckAccessOutput`
```typescript
{
  allowed: boolean;
  matchedRule?: AccessRule;
  reason?: string;
}
```

**Логика приоритета:**
1. Сначала проверяются **Block** правила
2. Если совпадение - доступ запрещён
3. Затем проверяются **Allow** правила
4. Если совпадение - доступ разрешён
5. По умолчанию - разрешено (можно изменить на запрет)

---

### 10. **GetRuleStatesUseCase**
Получение всех состояний правила.

**Input:**
- `ruleId` - ID правила

**Output:** `AccessRuleState[]`

---

## 🎯 Примеры использования

### Создание правила блокировки
```typescript
const rule = await createAccessRuleUseCase.execute({
  userId: 'user-123',
  name: 'Block Social Media',
  description: 'Блокировка социальных сетей',
  condition: new AccessRuleListCondition([
    'facebook.com',
    'instagram.com',
    'twitter.com'
  ])
});
```

### Включение правила для пользователя
```typescript
await enableAccessRuleUseCase.execute({
  ruleId: rule.id,
  scope: {
    type: AccessRuleStateScopeType.User,
    id: 'user-456'
  },
  userId: 'admin-123'
});
```

### Проверка доступа
```typescript
const result = await checkAccessUseCase.execute({
  userId: 'user-456',
  resourceUrl: 'facebook.com'
});

if (!result.allowed) {
  console.log(`Access denied: ${result.reason}`);
}
```

## 📦 Структура файлов

```
src/core/use-cases/access-control/
├── create-access-rule.use-case.ts
├── get-access-rule.use-case.ts
├── get-all-access-rules.use-case.ts
├── update-access-rule.use-case.ts
├── delete-access-rule.use-case.ts
├── enable-access-rule.use-case.ts
├── disable-access-rule.use-case.ts
├── get-enabled-rules-for-user.use-case.ts
├── check-access.use-case.ts
├── get-rule-states.use-case.ts
└── index.ts (barrel export)
```

## ⚠️ Важные замечания

1. **Транзакции**: `CreateAccessRuleUseCase` создаёт правило и состояние в одной транзакции
2. **Каскадное удаление**: При удалении правила автоматически удаляются все его состояния
3. **Приоритет правил**: Block > Allow > Default (allow)
4. **Аудит**: Все изменения сохраняют `createdBy` и `updatedBy`
5. **Scope типы**: User (для конкретного пользователя), Group (для группы), Global (для всех)
