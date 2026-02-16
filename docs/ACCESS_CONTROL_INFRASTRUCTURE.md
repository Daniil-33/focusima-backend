# Access Control Infrastructure Layer

## Обзор

Infrastructure слой для модуля Access Control реализован с использованием **TypeORM** и включает:

- **ORM Entities** - сущности базы данных
- **Mappers** - преобразование между доменными сущностями и ORM entities
- **Repository** - реализация паттерна Repository с поддержкой транзакций
- **Migration** - миграция базы данных для создания таблиц

---

## 🗄️ Структура базы данных

### Таблица `access_rules`

```sql
CREATE TABLE access_rules (
    id UUID PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description VARCHAR(500) NOT NULL,
    effect VARCHAR(20) NOT NULL,  -- 'allow' | 'block'
    condition JSONB NOT NULL,      -- Strategy Pattern: { type, values/pattern }
    created_by_user_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);
```

**condition JSONB структура:**
```json
// Для List condition
{
    "type": "List",
    "values": ["google.com", "youtube.com"]
}

// Для Regex condition
{
    "type": "Regex",
    "pattern": "^.*\\.ru$"
}
```

### Таблица `access_rule_states`

```sql
CREATE TABLE access_rule_states (
    id UUID PRIMARY KEY,
    rule_id UUID NOT NULL REFERENCES access_rules(id) ON DELETE CASCADE,
    scope_type VARCHAR(50) NOT NULL,   -- 'User' | 'Group' | 'Global'
    scope_id VARCHAR(255),             -- userId/groupId (NULL для Global)
    is_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    UNIQUE (rule_id, scope_type, scope_id)  -- Предотвращение дубликатов
);

CREATE INDEX idx_access_rule_states_rule_id ON access_rule_states(rule_id);
```

---

## 📁 Файлы Infrastructure Layer

### ORM Entities

#### `access-rule.orm-entity.ts`
```typescript
@Entity('access_rules')
export class AccessRuleOrmEntity {
    @PrimaryColumn('uuid')
    id: string;

    @Column({ type: 'jsonb' })
    condition: {
        type: string;
        values?: string[];
        pattern?: string;
    };

    @OneToMany(() => AccessRuleStateOrmEntity, (state) => state.rule)
    states: AccessRuleStateOrmEntity[];
}
```

#### `access-rule-state.orm-entity.ts`
```typescript
@Entity('access_rule_states')
@Index(['ruleId', 'scopeType', 'scopeId'], { unique: true })
export class AccessRuleStateOrmEntity {
    @PrimaryColumn('uuid')
    id: string;

    @Column({ type: 'uuid', name: 'rule_id' })
    ruleId: string;

    @ManyToOne(() => AccessRuleOrmEntity, (rule) => rule.states, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'rule_id' })
    rule: AccessRuleOrmEntity;
}
```

---

### Mappers

#### `access-rule.mapper.ts`
Преобразует между `AccessRule` (domain) ↔ `AccessRuleOrmEntity` (ORM)

**Ключевые методы:**
- `toOrm(domain)` - Domain → ORM (сериализует condition в JSONB)
- `toDomain(orm)` - ORM → Domain (десериализует JSONB в strategy objects)
- `toDomainArray(orms)` - Массовое преобразование

**Особенности:**
- Автоматически определяет тип правила (Allow/Block) по `effect`
- Создает правильный `Condition` объект (List/Regex) из JSONB

#### `access-rule-state.mapper.ts`
Преобразует между `AccessRuleState` (domain) ↔ `AccessRuleStateOrmEntity` (ORM)

---

### Repository

#### `typeorm-access-rule.repository.ts`

Реализует `IAccessRuleRepository` с полной поддержкой:

**CRUD операции:**
```typescript
// Правила
create(rule: AccessRule): Promise<AccessRule>
findById(id: string): Promise<AccessRule | null>
findByName(name: string): Promise<AccessRule | null>
findAll(): Promise<AccessRule[]>
update(rule: AccessRule): Promise<AccessRule>
delete(id: string): Promise<void>

// Состояния
createState(state: AccessRuleState): Promise<AccessRuleState>
findStateById(id: string): Promise<AccessRuleState | null>
findStatesByRuleId(ruleId: string): Promise<AccessRuleState[]>
updateState(state: AccessRuleState): Promise<AccessRuleState>
deleteState(id: string): Promise<void>
```

**Бизнес-методы:**
```typescript
// Транзакционное создание правила + состояния
createRuleWithState(
    rule: AccessRule, 
    state: AccessRuleState
): Promise<{ rule, state }>

// Поиск включенных правил
findEnabledRulesByScope(scope: AccessRuleStateScope): Promise<AccessRule[]>
findEnabledStatesByRuleId(ruleId: string): Promise<AccessRuleState[]>
```

**Транзакции:**
```typescript
async createRuleWithState(rule, state) {
    return await this.dataSource.transaction(async (manager) => {
        // Атомарное сохранение правила и состояния
        const savedRule = await manager.save(AccessRuleOrmEntity, ruleOrm);
        const savedState = await manager.save(AccessRuleStateOrmEntity, stateOrm);
        return { rule: savedRule, state: savedState };
    });
}
```

---

## 🔧 Использование

### 1. Миграция базы данных

```bash
# Запустить Docker Compose с PostgreSQL
docker-compose up -d

# Применить миграции
npm run migration:run
```

### 2. Регистрация в модуле

```typescript
@Module({
    imports: [
        TypeOrmModule.forFeature([
            AccessRuleOrmEntity,
            AccessRuleStateOrmEntity,
        ]),
    ],
    providers: [
        AccessRuleMapper,
        AccessRuleStateMapper,
        {
            provide: ACCESS_RULE_REPOSITORY,
            useClass: TypeOrmAccessRuleRepository,
        },
    ],
})
export class AccessControlModule {}
```

### 3. Использование в Use-Case

```typescript
@Injectable()
export class CreateAccessRuleUseCase {
    constructor(
        @Inject(ACCESS_RULE_REPOSITORY)
        private readonly repository: IAccessRuleRepository,
    ) {}

    async execute(input: CreateAccessRuleInput) {
        const rule = new AllowRule({ ... });
        const state = new AccessRuleState({ ... });

        // Транзакционное создание
        return await this.repository.createRuleWithState(rule, state);
    }
}
```

---

## 🔌 REST API

### POST `/access-control/rules` (Создать правило)

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Request Body:**
```json
{
    "name": "Block Russian Sites",
    "description": "Block all .ru domains",
    "effect": "block",
    "condition": {
        "type": "Regex",
        "data": {
            "pattern": "^.*\\.ru$"
        }
    }
}
```

**Response:**
```json
{
    "message": "Access rule created successfully",
    "ruleId": "123e4567-e89b-12d3-a456-426614174000"
}
```

**Пример с curl:**
```bash
# 1. Получить JWT токен
TOKEN=$(curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}' \
  | jq -r '.accessToken')

# 2. Создать правило
curl -X POST http://localhost:3000/access-control/rules \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Allow Social Media",
    "description": "Allow access to social media sites",
    "effect": "allow",
    "condition": {
        "type": "List",
        "data": {
            "values": ["facebook.com", "twitter.com", "instagram.com"]
        }
    }
  }'
```

---

## 🔒 Защита JWT Guards

Все эндпоинты защищены глобальным JWT Guard:

```typescript
@Controller('access-control')
export class AccessControlController {
    @Post('rules')
    async createRule(
        @Body() dto: CreateAccessRuleDto,
        @CurrentUser() user: User,  // Автоматически из JWT
    ) {
        // user.id берется из токена
        await this.createAccessRuleUseCase.execute({
            userId: user.id,
            ...dto,
        });
    }
}
```

**Как работает:**
1. JWT Guard проверяет токен в заголовке `Authorization: Bearer <token>`
2. `@CurrentUser()` декоратор извлекает пользователя из `request.user`
3. `userId` автоматически подставляется из JWT payload
4. Пользователь не может подделать `createdByUserId` - он берется из токена

---

## 🧪 Тестирование

### Query Builder для сложных запросов

```typescript
// Найти все включенные правила для пользователя
const rules = await this.ruleRepository
    .createQueryBuilder('rule')
    .innerJoin('rule.states', 'state')
    .where('state.scopeType = :type', { type: 'User' })
    .andWhere('state.scopeId = :userId', { userId: '123' })
    .andWhere('state.isEnabled = true')
    .getMany();
```

### JSONB queries

```typescript
// Поиск правил с List condition содержащим "google.com"
const rules = await this.ruleRepository
    .createQueryBuilder('rule')
    .where("rule.condition->>'type' = :type", { type: 'List' })
    .andWhere("rule.condition @> :condition", {
        condition: JSON.stringify({ values: ['google.com'] })
    })
    .getMany();
```

---

## 📝 TODO

- [ ] Добавить индексы для JSONB queries (GIN)
- [ ] Кэширование часто используемых правил (Redis)
- [ ] Batch операции для массового включения/отключения правил
- [ ] Аудит лог изменений правил (event sourcing)
- [ ] Версионирование правил (soft delete + history table)

---

## 🐛 Известные предупреждения

**TypeScript warnings:**
- `Unsafe assignment of any value` в mappers - это нормально для динамических condition объектов
- `Property does not exist on type unknown` в relations - TypeORM issue, не влияет на работу

**Решение:**
```typescript
// Можно добавить type assertions
const condition = createAccessRuleDto.condition as AccessRuleMatchCondition;
```

---

## 📚 Дополнительные ресурсы

- [TypeORM Documentation](https://typeorm.io/)
- [PostgreSQL JSONB](https://www.postgresql.org/docs/current/datatype-json.html)
- [Strategy Pattern](https://refactoring.guru/design-patterns/strategy)
- [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)
