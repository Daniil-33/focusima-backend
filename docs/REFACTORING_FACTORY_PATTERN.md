# Рефакторинг: Factory Pattern для создания Domain объектов

## 🎯 Проблема

**До рефакторинга:**
Контроллер (Presentation слой) создавал domain объекты напрямую:

```typescript
// ❌ ПЛОХО: Domain логика в контроллере
@Controller('access-control')
export class AccessControlController {
    async createRule(@Body() dto: CreateAccessRuleDto) {
        // Контроллер знает о внутренних domain классах!
        let condition;
        if (dto.condition.type === 'List') {
            condition = new AccessRuleListCondition(dto.condition.data.values || []);
        } else if (dto.condition.type === 'Regex') {
            condition = new AccessRuleRegexCondition(dto.condition.data.pattern || '');
        }
        
        await this.useCase.execute({ condition, ... });
    }
}
```

**Проблемы:**
1. ❌ **Нарушение Clean Architecture** - Presentation слой зависит от Core
2. ❌ **Низкая связность** - контроллер знает о всех типах Condition
3. ❌ **Дублирование кода** - при добавлении новых эндпоинтов придётся копировать логику
4. ❌ **Сложное тестирование** - нужно мокать domain классы в тестах контроллера
5. ❌ **Нарушение SRP** - контроллер отвечает и за HTTP, и за создание domain объектов

---

## ✅ Решение: Factory Pattern

### 1. Создана фабрика в Infrastructure слое

```typescript
// ✅ ХОРОШО: Factory инкапсулирует логику создания
@Injectable()
export class AccessRuleConditionFactory {
    createFromDto(conditionDto: ConditionData): AccessRuleMatchCondition {
        switch (conditionDto.type) {
            case 'List':
                if (!conditionDto.data.values?.length) {
                    throw new Error('List condition requires at least one value');
                }
                return new AccessRuleListCondition(conditionDto.data.values);

            case 'Regex':
                if (!conditionDto.data.pattern?.trim()) {
                    throw new Error('Regex condition requires a pattern');
                }
                return new AccessRuleRegexCondition(conditionDto.data.pattern);

            default:
                throw new Error(`Unknown condition type`);
        }
    }
}
```

### 2. Контроллер упростился

```typescript
// ✅ ХОРОШО: Контроллер делегирует создание фабрике
@Controller('access-control')
export class AccessControlController {
    constructor(
        private readonly createAccessRuleUseCase: CreateAccessRuleUseCase,
        private readonly conditionFactory: AccessRuleConditionFactory, // ← Инъекция фабрики
    ) {}

    async createRule(@Body() dto: CreateAccessRuleDto, @CurrentUser() user: User) {
        // Простое делегирование фабрике
        const condition = this.conditionFactory.createFromDto(dto.condition);
        
        return await this.createAccessRuleUseCase.execute({
            userId: user.id,
            condition, // ← Domain объект готов
            ...dto,
        });
    }
}
```

---

## 📊 Преимущества рефакторинга

### 1. **Separation of Concerns**
- ✅ Контроллер только принимает HTTP запросы и вызывает use-case
- ✅ Фабрика инкапсулирует логику создания domain объектов
- ✅ Use-case работает с чистыми domain объектами

### 2. **Повторное использование**
```typescript
// Фабрику можно использовать в других местах
export class UpdateAccessRuleController {
    async updateRule(@Body() dto: UpdateAccessRuleDto) {
        const condition = this.conditionFactory.createFromDto(dto.condition); // ← Reuse!
        // ...
    }
}
```

### 3. **Легкое добавление новых типов Condition**
```typescript
// Добавляем новый тип только в одном месте
export class AccessRuleConditionFactory {
    createFromDto(dto: ConditionData): AccessRuleMatchCondition {
        switch (dto.type) {
            case 'List': return new AccessRuleListCondition(...);
            case 'Regex': return new AccessRuleRegexCondition(...);
            case 'TimeRange': return new AccessRuleTimeRangeCondition(...); // ← Новый тип
            // ...
        }
    }
}
```

### 4. **Валидация в одном месте**
```typescript
export class AccessRuleConditionFactory {
    createFromDto(dto: ConditionData): AccessRuleMatchCondition {
        // Централизованная валидация
        if (dto.type === 'Regex') {
            this.validateRegexPattern(dto.data.pattern); // ← Проверка корректности regex
        }
        // ...
    }

    private validateRegexPattern(pattern: string): void {
        try {
            new RegExp(pattern);
        } catch {
            throw new Error(`Invalid regex pattern: ${pattern}`);
        }
    }
}
```

### 5. **Простое тестирование**
```typescript
// Тест контроллера - мокаем только фабрику
describe('AccessControlController', () => {
    it('should create rule', async () => {
        const mockFactory = {
            createFromDto: jest.fn().mockReturnValue(mockCondition)
        };
        
        const controller = new AccessControlController(useCase, mockFactory);
        // Тест упрощается!
    });
});

// Тест фабрики отдельно
describe('AccessRuleConditionFactory', () => {
    it('should create List condition', () => {
        const factory = new AccessRuleConditionFactory();
        const condition = factory.createFromDto({
            type: 'List',
            data: { values: ['google.com'] }
        });
        expect(condition).toBeInstanceOf(AccessRuleListCondition);
    });
});
```

---

## 🏗️ Архитектурная схема

### До рефакторинга:
```
┌─────────────────────────────────────┐
│   Presentation Layer                │
│                                     │
│   AccessControlController           │
│   - знает о AccessRuleListCondition │
│   - знает о AccessRuleRegexCondition│
│   - создаёт domain объекты          │
│         ↓ прямая зависимость        │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│   Core Layer                        │
│   - AccessRuleListCondition         │
│   - AccessRuleRegexCondition        │
└─────────────────────────────────────┘
```

### После рефакторинга:
```
┌─────────────────────────────────────┐
│   Presentation Layer                │
│                                     │
│   AccessControlController           │
│   - НЕ знает о конкретных Condition │
│   - использует абстракцию Factory   │
└─────────────────────────────────────┘
         ↓ зависимость через DI
┌─────────────────────────────────────┐
│   Infrastructure Layer              │
│                                     │
│   AccessRuleConditionFactory        │
│   - инкапсулирует создание          │
│   - знает о всех типах Condition    │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│   Core Layer                        │
│   - AccessRuleMatchCondition        │
│   - AccessRuleListCondition         │
│   - AccessRuleRegexCondition        │
└─────────────────────────────────────┘
```

---

## 🔍 Альтернативные подходы

### Вариант 2: Builder Pattern
```typescript
// Если создание condition сложное и многоступенчатое
export class AccessRuleConditionBuilder {
    private type: string;
    private values: string[];
    private pattern: string;

    withType(type: string) {
        this.type = type;
        return this;
    }

    withValues(values: string[]) {
        this.values = values;
        return this;
    }

    build(): AccessRuleMatchCondition {
        // Построение объекта с валидацией
    }
}

// Использование
const condition = new AccessRuleConditionBuilder()
    .withType('List')
    .withValues(['google.com'])
    .build();
```

### Вариант 3: Mapper в Use-Case
```typescript
// Если логика простая, можно в use-case
export class CreateAccessRuleUseCase {
    execute(input: CreateAccessRuleInput) {
        const condition = this.mapCondition(input.conditionDto); // ← Внутри use-case
        // ...
    }

    private mapCondition(dto: ConditionDto): AccessRuleMatchCondition {
        // Mapping логика
    }
}

// ❌ Минусы: не переиспользуется, дублирование в других use-cases
```

---

## 📝 Чеклист рефакторинга

- [x] Создана фабрика `AccessRuleConditionFactory`
- [x] Фабрика зарегистрирована в `AccessControlModule`
- [x] Контроллер инжектит фабрику через constructor
- [x] Контроллер использует `factory.createFromDto()`
- [x] Удалены импорты domain классов из контроллера
- [x] Добавлена валидация в фабрику
- [ ] Написаны unit-тесты для фабрики (TODO)
- [ ] Обновлены интеграционные тесты контроллера (TODO)

---

## 🚀 Дальнейшие улучшения

1. **Добавить валидацию List values:**
   ```typescript
   createFromDto(dto: ConditionData): AccessRuleMatchCondition {
       if (dto.type === 'List') {
           this.validateListValues(dto.data.values); // ← Проверка URL
       }
   }

   private validateListValues(values: string[]): void {
       values.forEach(value => {
           if (!this.isValidUrl(value)) {
               throw new Error(`Invalid URL: ${value}`);
           }
       });
   }
   ```

2. **Кэширование compiled regex:**
   ```typescript
   private regexCache = new Map<string, RegExp>();

   createFromDto(dto: ConditionData): AccessRuleMatchCondition {
       if (dto.type === 'Regex') {
           const cached = this.regexCache.get(dto.data.pattern);
           if (cached) return new AccessRuleRegexCondition(cached);
           
           const regex = new RegExp(dto.data.pattern);
           this.regexCache.set(dto.data.pattern, regex);
           return new AccessRuleRegexCondition(regex);
       }
   }
   ```

3. **Strategy Registry для расширяемости:**
   ```typescript
   @Injectable()
   export class AccessRuleConditionFactory {
       private strategies = new Map<string, ConditionStrategy>();

       constructor() {
           this.registerStrategy('List', new ListConditionStrategy());
           this.registerStrategy('Regex', new RegexConditionStrategy());
       }

       createFromDto(dto: ConditionData): AccessRuleMatchCondition {
           const strategy = this.strategies.get(dto.type);
           if (!strategy) throw new Error(`Unknown type: ${dto.type}`);
           return strategy.create(dto.data);
       }
   }
   ```

---

## 📚 Паттерны проектирования

Использованные паттерны:
- **Factory Pattern** - создание объектов через фабричный метод
- **Dependency Injection** - инъекция фабрики через NestJS DI
- **Strategy Pattern** - разные типы Condition (List, Regex)
- **Single Responsibility** - каждый класс имеет одну ответственность

---

## ✅ Итог

**Было:**
- Контроллер = HTTP + создание domain объектов (2 ответственности)
- Дублирование логики при добавлении новых эндпоинтов
- Сложное тестирование

**Стало:**
- Контроллер = только HTTP
- Factory = только создание domain объектов
- Переиспользуемая логика
- Простое тестирование
- Легко расширяемая архитектура

**Clean Architecture соблюдена! 🎉**
