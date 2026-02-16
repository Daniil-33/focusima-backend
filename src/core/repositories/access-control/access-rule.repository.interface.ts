import { AccessRule } from 'src/core/entities/access-control/rules/access-rule';
import { AccessRuleState } from 'src/core/entities/access-control/rules-state/access-rule-state';
import { AccessRuleStateScope } from 'src/core/entities/access-control/rules-state/access-rule-state-scope.vo';

export interface IAccessRuleRepository {
    // === CRUD операции для правил ===
    create(rule: AccessRule): Promise<AccessRule>;
    findById(id: string): Promise<AccessRule | null>;
    findByName(name: string): Promise<AccessRule | null>;
    findAll(): Promise<AccessRule[]>;
    findByCreator(creatorId: string): Promise<AccessRule[]>;
    update(rule: AccessRule): Promise<AccessRule>;
    delete(id: string): Promise<void>;

    // === CRUD операции для состояний ===
    createState(state: AccessRuleState): Promise<AccessRuleState>;
    findStateById(id: string): Promise<AccessRuleState | null>;
    findStatesByRuleId(ruleId: string): Promise<AccessRuleState[]>;
    findStateByScope(scope: AccessRuleStateScope): Promise<AccessRuleState[]>;
    updateState(state: AccessRuleState): Promise<AccessRuleState>;
    deleteState(id: string): Promise<void>;

    // === Бизнес-методы ===
    // Транзакционное создание правила + состояния
    createRuleWithState(
        rule: AccessRule,
        state: AccessRuleState,
    ): Promise<{ rule: AccessRule; state: AccessRuleState }>;

    // Поиск состояний
    findEnabledStatesByRuleId(ruleId: string): Promise<AccessRuleState[]>;
    findByRuleIdAndScope(
        ruleId: string,
        scope: AccessRuleStateScope,
    ): Promise<AccessRuleState | null>;

    // Поиск правил по scope
    findEnabledRulesByScope(scope: AccessRuleStateScope): Promise<AccessRule[]>;
}

// Token для Dependency Injection в NestJS
export const ACCESS_RULE_REPOSITORY = Symbol('ACCESS_RULE_REPOSITORY');
