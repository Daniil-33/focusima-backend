// Use Case - получение всех включенных правил для пользователя
import { Inject, Injectable } from '@nestjs/common';
import { AccessRule } from 'src/core/entities/access-control/rules/access-rule';
import { AccessRuleStateScopeType } from 'src/core/entities/access-control/rules-state/access-rule-state-scope.vo';
import type { IAccessRuleRepository } from 'src/core/repositories/access-control/access-rule.repository.interface';
import { ACCESS_RULE_REPOSITORY } from 'src/core/repositories/access-control/access-rule.repository.interface';

export interface GetEnabledRulesForUserInput {
    userId: string;
}

@Injectable()
export class GetEnabledRulesForUserUseCase {
    constructor(
        @Inject(ACCESS_RULE_REPOSITORY)
        private readonly accessRuleRepository: IAccessRuleRepository,
    ) {}

    async execute(input: GetEnabledRulesForUserInput): Promise<AccessRule[]> {
        // Получаем правила для:
        // 1. Глобального scope (применяются ко всем)
        // 2. Конкретного пользователя

        const userScope = {
            type: AccessRuleStateScopeType.User,
            id: input.userId,
        };

        const globalScope = {
            type: AccessRuleStateScopeType.Global,
            id: null,
        };

        // Получаем включенные правила для пользователя
        const userRules = await this.accessRuleRepository.findEnabledRulesByScope(userScope);

        // Получаем глобальные правила
        const globalRules = await this.accessRuleRepository.findEnabledRulesByScope(globalScope);

        // Объединяем и убираем дубликаты
        const allRules = [...userRules, ...globalRules];
        const uniqueRules = Array.from(new Map(allRules.map((rule) => [rule.id, rule])).values());

        return uniqueRules;
    }
}
