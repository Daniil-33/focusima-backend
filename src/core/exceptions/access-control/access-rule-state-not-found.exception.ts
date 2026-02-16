// Exception - состояние правила не найдено
import { NotFoundException } from '@nestjs/common';
import { AccessRuleStateScope } from 'src/core/entities/access-control/rules-state/access-rule-state-scope.vo';

export class AccessRuleStateNotFoundException extends NotFoundException {
    constructor(ruleId: string, scope: AccessRuleStateScope) {
        super(
            `Access rule state not found for rule "${ruleId}" and scope: ${scope.type}:${scope.id || 'global'}`,
        );
    }
}
