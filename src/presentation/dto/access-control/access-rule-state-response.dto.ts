// Response DTO для AccessRuleState
export class AccessRuleStateResponseDto {
    id: string;
    ruleId: string;
    scopeType: string;
    scopeId: string | null;
    isEnabled: boolean;
    createdAt: Date;
    updatedAt: Date;
}
