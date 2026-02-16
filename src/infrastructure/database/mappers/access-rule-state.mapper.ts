// Mapper для преобразования между доменной сущностью AccessRuleState и ORM entity
import { Injectable } from '@nestjs/common';
import { AccessRuleState } from '../../../core/entities/access-control/rules-state/access-rule-state';
import { AccessRuleStateOrmEntity } from '../entities/access-rule-state.orm-entity';
import {
    AccessRuleStateScope,
    AccessRuleStateScopeType,
} from '../../../core/entities/access-control/rules-state/access-rule-state-scope.vo';

@Injectable()
export class AccessRuleStateMapper {
    // Domain → ORM
    toOrm(domain: AccessRuleState): AccessRuleStateOrmEntity {
        const orm = new AccessRuleStateOrmEntity();

        orm.id = domain.id;
        orm.ruleId = domain.ruleId;
        orm.scopeType = domain.scope.type;
        orm.scopeId = domain.scope.id;
        orm.isEnabled = domain.isEnabled;
        orm.createdAt = domain.createdAt;
        orm.updatedAt = domain.updatedAt;

        return orm;
    }

    // ORM → Domain
    toDomain(orm: AccessRuleStateOrmEntity): AccessRuleState {
        const scope: AccessRuleStateScope = {
            type: orm.scopeType as AccessRuleStateScopeType,
            id: orm.scopeId,
        };

        return new AccessRuleState({
            id: orm.id,
            ruleId: orm.ruleId,
            scope,
            isEnabled: orm.isEnabled,
            createdAt: orm.createdAt,
            updatedAt: orm.updatedAt,
        });
    }

    // Массив ORM → Массив Domain
    toDomainArray(orms: AccessRuleStateOrmEntity[]): AccessRuleState[] {
        return orms.map((orm) => this.toDomain(orm));
    }
}
