// Use Case - проверка доступа к ресурсу
import { Inject, Injectable } from '@nestjs/common';
import { AccessRule } from 'src/core/entities/access-control/rules/access-rule';
import { AllowRule } from 'src/core/entities/access-control/rules/allow-rule.entity';
import { BlockRule } from 'src/core/entities/access-control/rules/block-rule.entity';
import type { IAccessRuleRepository } from 'src/core/repositories/access-control/access-rule.repository.interface';
import { ACCESS_RULE_REPOSITORY } from 'src/core/repositories/access-control/access-rule.repository.interface';
import { GetEnabledRulesForUserUseCase } from './get-enabled-rules-for-user.use-case';

export interface CheckAccessInput {
    userId: string;
    resourceUrl: string; // Например, URL сайта или домен
}

export interface CheckAccessOutput {
    allowed: boolean;
    matchedRule?: AccessRule;
    reason?: string;
}

@Injectable()
export class CheckAccessUseCase {
    constructor(
        @Inject(ACCESS_RULE_REPOSITORY)
        private readonly accessRuleRepository: IAccessRuleRepository,
        private readonly getEnabledRulesUseCase: GetEnabledRulesForUserUseCase,
    ) {}

    async execute(input: CheckAccessInput): Promise<CheckAccessOutput> {
        // Получаем все включенные правила для пользователя
        const enabledRules = await this.getEnabledRulesUseCase.execute({
            userId: input.userId,
        });

        // Проверяем правила по приоритету: сначала блокирующие, потом разрешающие
        const blockRules = enabledRules.filter((rule) => rule instanceof BlockRule);
        const allowRules = enabledRules.filter((rule) => rule instanceof AllowRule);

        // 1. Проверяем блокирующие правила
        for (const rule of blockRules) {
            if (rule.condition.matches(input.resourceUrl)) {
                return {
                    allowed: false,
                    matchedRule: rule,
                    reason: `Blocked by rule: ${rule.name}`,
                };
            }
        }

        // 2. Проверяем разрешающие правила
        for (const rule of allowRules) {
            if (rule.condition.matches(input.resourceUrl)) {
                return {
                    allowed: true,
                    matchedRule: rule,
                    reason: `Allowed by rule: ${rule.name}`,
                };
            }
        }

        // 3. По умолчанию - разрешаем доступ (если нет правил)
        // Можно изменить на запрет по умолчанию
        return {
            allowed: true,
            reason: 'No matching rules, default policy: allow',
        };
    }
}
