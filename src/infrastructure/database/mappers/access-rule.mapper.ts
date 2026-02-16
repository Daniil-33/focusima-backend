// Mapper для преобразования между доменной сущностью AccessRule и ORM entity
import { Injectable } from '@nestjs/common';
import { AccessRule } from '../../../core/entities/access-control/rules/access-rule';
import { AllowRule } from '../../../core/entities/access-control/rules/allow-rule.entity';
import { BlockRule } from '../../../core/entities/access-control/rules/block-rule.entity';
import { AccessRuleOrmEntity } from '../entities/access-rule.orm-entity';
import { AccessRuleListCondition } from '../../../core/entities/access-control/rules/condition/access-rule-list-condition';
import { AccessRuleRegexCondition } from '../../../core/entities/access-control/rules/condition/access-rule-regex-condition';
import { AccessRuleType } from '../../../core/entities/access-control/rules/condition/access-rule-match-condition';

@Injectable()
export class AccessRuleMapper {
    // Domain → ORM
    toOrm(domain: AccessRule): AccessRuleOrmEntity {
        const orm = new AccessRuleOrmEntity();

        orm.id = domain.id;
        orm.name = domain.name;
        orm.description = domain.description;
        // Приводим к конкретному типу для доступа к effect
        orm.effect = (domain as AllowRule | BlockRule).effect;
        orm.createdByUserId = domain.createdByUserId;
        orm.createdAt = domain.createdAt;
        orm.updatedAt = domain.updatedAt;

        // Сериализация condition в JSONB
        if (domain.condition.type === AccessRuleType.List) {
            const listCondition = domain.condition as AccessRuleListCondition;
            orm.condition = {
                type: 'List',
                values: listCondition['_values'], // Доступ к приватному полю
            };
        } else if (domain.condition.type === AccessRuleType.Regex) {
            const regexCondition = domain.condition as AccessRuleRegexCondition;
            orm.condition = {
                type: 'Regex',
                pattern: regexCondition['_pattern'], // Доступ к приватному полю
            };
        }

        return orm;
    }

    // ORM → Domain
    toDomain(orm: AccessRuleOrmEntity): AccessRule {
        // Десериализация condition из JSONB
        let condition;
        if (orm.condition.type === 'List') {
            condition = new AccessRuleListCondition(orm.condition.values || []);
        } else if (orm.condition.type === 'Regex') {
            condition = new AccessRuleRegexCondition(orm.condition.pattern || '');
        } else {
            throw new Error(`Unknown condition type: ${orm.condition.type}`);
        }

        // Создаём правильный тип правила на основе effect
        if (orm.effect === 'allow') {
            return new AllowRule({
                id: orm.id,
                name: orm.name,
                description: orm.description,
                condition,
                createdByUserId: orm.createdByUserId,
                createdAt: orm.createdAt,
                updatedAt: orm.updatedAt,
            });
        } else if (orm.effect === 'block') {
            return new BlockRule({
                id: orm.id,
                name: orm.name,
                description: orm.description,
                condition,
                createdByUserId: orm.createdByUserId,
                createdAt: orm.createdAt,
                updatedAt: orm.updatedAt,
            });
        } else {
            throw new Error(`Unknown effect type: ${orm.effect}`);
        }
    }

    // Массив ORM → Массив Domain
    toDomainArray(orms: AccessRuleOrmEntity[]): AccessRule[] {
        return orms.map((orm) => this.toDomain(orm));
    }
}
