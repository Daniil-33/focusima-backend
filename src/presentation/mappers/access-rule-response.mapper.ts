// Mapper для преобразования Domain entities в Response DTOs
import { Injectable } from '@nestjs/common';
import { AccessRule } from '../../core/entities/access-control/rules/access-rule';
import { AccessRuleState } from '../../core/entities/access-control/rules-state/access-rule-state';
import { AccessRuleResponseDto } from '../dto/access-control/access-rule-response.dto';
import { AccessRuleStateResponseDto } from '../dto/access-control/access-rule-state-response.dto';
import { AccessRuleListCondition } from '../../core/entities/access-control/rules/condition/access-rule-list-condition';
import { AccessRuleRegexCondition } from '../../core/entities/access-control/rules/condition/access-rule-regex-condition';
import { AccessRuleType } from '../../core/entities/access-control/rules/condition/access-rule-match-condition';
import { AllowRule } from '../../core/entities/access-control/rules/allow-rule.entity';
import { BlockRule } from '../../core/entities/access-control/rules/block-rule.entity';

@Injectable()
export class AccessRuleResponseMapper {
    /**
     * Преобразует AccessRule domain entity в Response DTO
     */
    toResponseDto(rule: AccessRule): AccessRuleResponseDto {
        // Получаем effect из конкретного типа правила
        const effect = (rule as AllowRule | BlockRule).effect;

        // Сериализуем condition
        let conditionData: { values?: string[]; pattern?: string } = {};
        
        if (rule.condition.type === AccessRuleType.List) {
            const listCondition = rule.condition as AccessRuleListCondition;
            conditionData = {
                values: listCondition['_values'], // Приватное поле
            };
        } else if (rule.condition.type === AccessRuleType.Regex) {
            const regexCondition = rule.condition as AccessRuleRegexCondition;
            conditionData = {
                pattern: regexCondition['_pattern'], // Приватное поле
            };
        }

        return {
            id: rule.id,
            name: rule.name,
            description: rule.description,
            effect,
            condition: {
                type: rule.condition.type === AccessRuleType.List ? 'List' : 'Regex',
                data: conditionData,
            },
            createdByUserId: rule.createdByUserId,
            createdAt: rule.createdAt,
            updatedAt: rule.updatedAt,
        };
    }

    /**
     * Преобразует массив AccessRule в массив Response DTOs
     */
    toResponseDtoArray(rules: AccessRule[]): AccessRuleResponseDto[] {
        return rules.map((rule) => this.toResponseDto(rule));
    }

    /**
     * Преобразует AccessRuleState domain entity в Response DTO
     */
    toStateResponseDto(state: AccessRuleState): AccessRuleStateResponseDto {
        return {
            id: state.id,
            ruleId: state.ruleId,
            scopeType: state.scope.type,
            scopeId: state.scope.id,
            isEnabled: state.isEnabled,
            createdAt: state.createdAt,
            updatedAt: state.updatedAt,
        };
    }

    /**
     * Преобразует массив AccessRuleState в массив Response DTOs
     */
    toStateResponseDtoArray(states: AccessRuleState[]): AccessRuleStateResponseDto[] {
        return states.map((state) => this.toStateResponseDto(state));
    }
}
