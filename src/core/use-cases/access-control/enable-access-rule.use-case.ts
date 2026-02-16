// Use Case - включение правила доступа для scope
import { Inject, Injectable } from '@nestjs/common';
import { AccessRuleState } from 'src/core/entities/access-control/rules-state/access-rule-state';
import { AccessRuleStateScope } from 'src/core/entities/access-control/rules-state/access-rule-state-scope.vo';
import type { IAccessRuleRepository } from 'src/core/repositories/access-control/access-rule.repository.interface';
import { ACCESS_RULE_REPOSITORY } from 'src/core/repositories/access-control/access-rule.repository.interface';
import { AccessRuleNotFoundException } from 'src/core/exceptions/access-control/access-rule-not-found.exception';
import { AccessRuleAlreadyEnabledException } from 'src/core/exceptions/access-control/access-rule-already-enabled.exception';

export interface EnableAccessRuleInput {
    ruleId: string;
    scope: AccessRuleStateScope;
    userId: string; // Кто включает правило
}

@Injectable()
export class EnableAccessRuleUseCase {
    constructor(
        @Inject(ACCESS_RULE_REPOSITORY)
        private readonly accessRuleRepository: IAccessRuleRepository,
    ) {}

    async execute(input: EnableAccessRuleInput): Promise<AccessRuleState> {
        // Проверяем существование правила
        const rule = await this.accessRuleRepository.findById(input.ruleId);
        if (!rule) {
            throw new AccessRuleNotFoundException(input.ruleId);
        }

        // Проверяем, не включено ли уже правило для этого scope
        const existingState = await this.accessRuleRepository.findByRuleIdAndScope(
            input.ruleId,
            input.scope,
        );

        if (existingState) {
            if (existingState.isEnabled) {
                throw new AccessRuleAlreadyEnabledException(input.ruleId, input.scope);
            }
            // Если состояние существует, но отключено - обновляем
            existingState.updateIsEnabled(true);
            return await this.accessRuleRepository.updateState(existingState);
        }

        // Создаём новое состояние
        const state = new AccessRuleState({
            ruleId: input.ruleId,
            scope: input.scope,
            isEnabled: true,
        });

        return await this.accessRuleRepository.createState(state);
    }
}
