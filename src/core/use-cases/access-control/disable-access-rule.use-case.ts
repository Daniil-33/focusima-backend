// Use Case - отключение правила доступа для scope
import { Inject, Injectable } from '@nestjs/common';
import { AccessRuleState } from 'src/core/entities/access-control/rules-state/access-rule-state';
import { AccessRuleStateScope } from 'src/core/entities/access-control/rules-state/access-rule-state-scope.vo';
import type { IAccessRuleRepository } from 'src/core/repositories/access-control/access-rule.repository.interface';
import { ACCESS_RULE_REPOSITORY } from 'src/core/repositories/access-control/access-rule.repository.interface';
import { AccessRuleNotFoundException } from 'src/core/exceptions/access-control/access-rule-not-found.exception';
import { AccessRuleStateNotFoundException } from 'src/core/exceptions/access-control/access-rule-state-not-found.exception';

export interface DisableAccessRuleInput {
    ruleId: string;
    scope: AccessRuleStateScope;
    userId: string; // Кто отключает правило
}

@Injectable()
export class DisableAccessRuleUseCase {
    constructor(
        @Inject(ACCESS_RULE_REPOSITORY)
        private readonly accessRuleRepository: IAccessRuleRepository,
    ) {}

    async execute(input: DisableAccessRuleInput): Promise<AccessRuleState> {
        // Проверяем существование правила
        const rule = await this.accessRuleRepository.findById(input.ruleId);
        if (!rule) {
            throw new AccessRuleNotFoundException(input.ruleId);
        }

        // Находим состояние для этого scope
        const state = await this.accessRuleRepository.findByRuleIdAndScope(
            input.ruleId,
            input.scope,
        );

        if (!state) {
            throw new AccessRuleStateNotFoundException(input.ruleId, input.scope);
        }

        // Отключаем правило
        state.updateIsEnabled(false);

        return await this.accessRuleRepository.updateState(state);
    }
}
