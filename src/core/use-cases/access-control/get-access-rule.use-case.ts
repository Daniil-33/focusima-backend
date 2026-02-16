// Use Case - получение правила доступа по ID
import { Inject, Injectable } from '@nestjs/common';
import { AccessRule } from 'src/core/entities/access-control/rules/access-rule';
import type { IAccessRuleRepository } from 'src/core/repositories/access-control/access-rule.repository.interface';
import { ACCESS_RULE_REPOSITORY } from 'src/core/repositories/access-control/access-rule.repository.interface';
import { AccessRuleNotFoundException } from 'src/core/exceptions/access-control/access-rule-not-found.exception';

export interface GetAccessRuleInput {
    ruleId: string;
}

@Injectable()
export class GetAccessRuleUseCase {
    constructor(
        @Inject(ACCESS_RULE_REPOSITORY)
        private readonly accessRuleRepository: IAccessRuleRepository,
    ) {}

    async execute(input: GetAccessRuleInput): Promise<AccessRule> {
        const rule = await this.accessRuleRepository.findById(input.ruleId);

        if (!rule) {
            throw new AccessRuleNotFoundException(input.ruleId);
        }

        return rule;
    }
}
