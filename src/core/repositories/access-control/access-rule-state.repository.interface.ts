import { AccessRule } from 'src/core/entities/access-control/rules/access-rule';
import { AccessRuleState } from 'src/core/entities/access-control/rules-state/access-rule-state';
import { AccessRuleType } from 'src/core/entities/access-control/rules/condition/access-rule-match-condition';

export interface IAccessRuleRepository {
    // CRUD операции
    create(rule: AccessRule): Promise<AccessRule>;
    findById(id: string): Promise<AccessRule | null>;
    findAll(): Promise<AccessRule[]>;
    update(rule: AccessRule): Promise<AccessRule>;
    delete(id: string): Promise<void>;

    // Бизнес-методы
    findByCreatedByUserId(userId: string): Promise<AccessRule[]>;
    findByName(name: string): Promise<AccessRule | null>;
    findAllByType(type: AccessRuleType): Promise<AccessRule[]>;

    createRuleWithState(rule: AccessRule, state: AccessRuleState): Promise<AccessRule>;
}

// Token для Dependency Injection в NestJS
export const ACCESS_RULE_STATE_REPOSITORY = Symbol('ACCESS_RULE_STATE_REPOSITORY');
