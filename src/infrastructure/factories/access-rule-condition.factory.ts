// Factory для создания AccessRuleMatchCondition из DTO
import { Injectable } from '@nestjs/common';
import { AccessRuleMatchCondition } from '../../core/entities/access-control/rules/condition/access-rule-match-condition';
import { AccessRuleListCondition } from '../../core/entities/access-control/rules/condition/access-rule-list-condition';
import { AccessRuleRegexCondition } from '../../core/entities/access-control/rules/condition/access-rule-regex-condition';

export interface ConditionData {
    type: 'List' | 'Regex';
    data: {
        values?: string[];
        pattern?: string;
    };
}

@Injectable()
export class AccessRuleConditionFactory {
    /**
     * Создаёт domain объект AccessRuleMatchCondition из DTO
     * @param conditionDto - DTO с типом и данными условия
     * @returns Domain объект condition (List или Regex)
     * @throws Error если тип условия неизвестен
     */
    createFromDto(conditionDto: ConditionData): AccessRuleMatchCondition {
        switch (conditionDto.type) {
            case 'List':
                if (!conditionDto.data.values || conditionDto.data.values.length === 0) {
                    throw new Error('List condition requires at least one value');
                }
                return new AccessRuleListCondition(conditionDto.data.values);

            case 'Regex':
                if (!conditionDto.data.pattern || conditionDto.data.pattern.trim() === '') {
                    throw new Error('Regex condition requires a pattern');
                }
                return new AccessRuleRegexCondition(conditionDto.data.pattern);

            default:
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                throw new Error(`Unknown condition type: ${conditionDto.type}`);
        }
    }

    /**
     * Валидация regex паттерна
     */
    private validateRegexPattern(pattern: string): void {
        try {
            new RegExp(pattern);
        } catch {
            throw new Error(`Invalid regex pattern: ${pattern}`);
        }
    }
}
