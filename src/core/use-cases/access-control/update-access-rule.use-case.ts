// Use Case - обновление правила доступа
import { Inject, Injectable } from '@nestjs/common';
import { AccessRule } from 'src/core/entities/access-control/rules/access-rule';
import { AccessRuleMatchCondition } from 'src/core/entities/access-control/rules/condition/access-rule-match-condition';
import type { IAccessRuleRepository } from 'src/core/repositories/access-control/access-rule.repository.interface';
import { ACCESS_RULE_REPOSITORY } from 'src/core/repositories/access-control/access-rule.repository.interface';
import { AccessRuleNotFoundException } from 'src/core/exceptions/access-control/access-rule-not-found.exception';

export interface UpdateAccessRuleInput {
    ruleId: string;
    userId: string; // ID пользователя, который обновляет
    name?: string;
    description?: string;
    condition?: AccessRuleMatchCondition;
}

@Injectable()
export class UpdateAccessRuleUseCase {
    constructor(
        @Inject(ACCESS_RULE_REPOSITORY)
        private readonly accessRuleRepository: IAccessRuleRepository,
    ) {}

    async execute(input: UpdateAccessRuleInput): Promise<AccessRule> {
        // Получаем существующее правило
        const rule = await this.accessRuleRepository.findById(input.ruleId);

        if (!rule) {
            throw new AccessRuleNotFoundException(input.ruleId);
        }

        // Обновляем поля, если они переданы
        if (input.name !== undefined) {
            rule.updateName(input.name);
        }

        if (input.description !== undefined) {
            rule.updateDescription(input.description);
        }

        if (input.condition !== undefined) {
            rule.updateCondition(input.condition);
        }

        // Сохраняем обновлённое правило
        return await this.accessRuleRepository.update(rule);
    }
}
