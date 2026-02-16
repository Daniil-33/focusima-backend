/* eslint-disable @typescript-eslint/restrict-template-expressions */
// Use Case - бизнес-логика создания правила доступа
import { Inject, Injectable } from '@nestjs/common';

import { AccessRule, AccessRuleEffect } from 'src/core/entities/access-control/rules/access-rule';
import { AllowRule } from 'src/core/entities/access-control/rules/allow-rule.entity';
import { BlockRule } from 'src/core/entities/access-control/rules/block-rule.entity';

import { AccessRuleState } from 'src/core/entities/access-control/rules-state/access-rule-state';
import { AccessRuleStateScopeType } from 'src/core/entities/access-control/rules-state/access-rule-state-scope.vo';
import { AccessRuleMatchCondition } from 'src/core/entities/access-control/rules/condition/access-rule-match-condition';
import type { IAccessRuleRepository } from 'src/core/repositories/access-control/access-rule.repository.interface';
import { ACCESS_RULE_REPOSITORY } from 'src/core/repositories/access-control/access-rule.repository.interface';
import { AccessRuleAlreadyExistsException } from 'src/core/exceptions/access-control/access-control-exist.exception';

export interface CreateAccessRuleInput {
    userId: string;
    name: string;
    description: string;
    effect: AccessRuleEffect;
    condition: AccessRuleMatchCondition;
}

@Injectable()
export class CreateAccessRuleUseCase {
    constructor(
        @Inject(ACCESS_RULE_REPOSITORY)
        private readonly accessRuleRepository: IAccessRuleRepository,
    ) {}

    async execute(input: CreateAccessRuleInput): Promise<{
        rule: AccessRule;
        state: AccessRuleState;
    }> {
        // Проверяем, существует ли правило доступа с таким именем
        const existingRule = await this.accessRuleRepository.findByName(input.name);

        if (existingRule) {
            throw new AccessRuleAlreadyExistsException(input.name);
        }

        // Создаём доменную сущность
        let rule: AccessRule;

        switch (input.effect) {
            case AccessRuleEffect.Allow:
                rule = new AllowRule({
                    name: input.name,
                    description: input.description,
                    condition: input.condition,
                    createdByUserId: input.userId,
                });
                break;
            case AccessRuleEffect.Block:
                rule = new BlockRule({
                    name: input.name,
                    description: input.description,
                    condition: input.condition,
                    createdByUserId: input.userId,
                });
                break;
            default:
                throw new Error(`Unsupported effect type: ${input.effect}`);
        }

        const state = new AccessRuleState({
            ruleId: rule.id,
            scope: {
                type: AccessRuleStateScopeType.User, // По умолчанию глобальный scope
                id: input.userId,
            },
            isEnabled: false,
        });

        // Сохраняем через репозиторий
        return await this.accessRuleRepository.createRuleWithState(rule, state);
    }
}
