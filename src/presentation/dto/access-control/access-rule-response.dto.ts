// Response DTO для AccessRule
import { AccessRuleEffect } from '../../../core/entities/access-control/rules/access-rule';

export class AccessRuleResponseDto {
    id: string;
    name: string;
    description: string;
    effect: AccessRuleEffect;
    condition: {
        type: 'List' | 'Regex';
        data: {
            values?: string[];
            pattern?: string;
        };
    };
    createdByUserId: string;
    createdAt: Date;
    updatedAt: Date;
}
