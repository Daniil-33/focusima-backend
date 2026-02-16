// Use Case - получение всех правил доступа
import { Inject, Injectable } from '@nestjs/common';
import { AccessRule } from 'src/core/entities/access-control/rules/access-rule';
import type { IAccessRuleRepository } from 'src/core/repositories/access-control/access-rule.repository.interface';
import { ACCESS_RULE_REPOSITORY } from 'src/core/repositories/access-control/access-rule.repository.interface';

export interface GetAllAccessRulesInput {
    userId?: string; // Опционально: фильтр по создателю
}

@Injectable()
export class GetAllAccessRulesUseCase {
    constructor(
        @Inject(ACCESS_RULE_REPOSITORY)
        private readonly accessRuleRepository: IAccessRuleRepository,
    ) {}

    async execute(input?: GetAllAccessRulesInput): Promise<AccessRule[]> {
        if (input?.userId) {
            // Если нужно фильтровать по создателю
            return await this.accessRuleRepository.findByCreator(input.userId);
        }

        return await this.accessRuleRepository.findAll();
    }
}
