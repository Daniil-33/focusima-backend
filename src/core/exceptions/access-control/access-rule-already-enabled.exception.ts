// Exception - правило уже включено для данного scope
import { ConflictException } from '@nestjs/common';
import { AccessRuleStateScope } from 'src/core/entities/access-control/rules-state/access-rule-state-scope.vo';

export class AccessRuleAlreadyEnabledException extends ConflictException {
    constructor(ruleId: string, scope: AccessRuleStateScope) {
        super(
            `Access rule "${ruleId}" is already enabled for scope: ${scope.type}:${scope.id || 'global'}`,
        );
    }
}
