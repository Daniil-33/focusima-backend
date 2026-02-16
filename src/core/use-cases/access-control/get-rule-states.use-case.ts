// Use Case - получение всех состояний правила
import { Inject, Injectable } from '@nestjs/common';
import { AccessRuleState } from 'src/core/entities/access-control/rules-state/access-rule-state';
import type { IAccessRuleRepository } from 'src/core/repositories/access-control/access-rule.repository.interface';
import { ACCESS_RULE_REPOSITORY } from 'src/core/repositories/access-control/access-rule.repository.interface';
import { AccessRuleNotFoundException } from 'src/core/exceptions/access-control/access-rule-not-found.exception';

export interface GetRuleStatesInput {
    ruleId: string;
}

@Injectable()
export class GetRuleStatesUseCase {
    constructor(
        @Inject(ACCESS_RULE_REPOSITORY)
        private readonly accessRuleRepository: IAccessRuleRepository,
    ) {}

    async execute(input: GetRuleStatesInput): Promise<AccessRuleState[]> {
        // Проверяем существование правила
        const rule = await this.accessRuleRepository.findById(input.ruleId);
        if (!rule) {
            throw new AccessRuleNotFoundException(input.ruleId);
        }

        // Получаем все состояния правила
        return await this.accessRuleRepository.findStatesByRuleId(input.ruleId);
    }
}
