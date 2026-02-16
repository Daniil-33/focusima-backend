export enum AccessRuleType {
    List = 'list',
    Regex = 'regex',
}

export interface AccessRuleMatchCondition {
    type: AccessRuleType;
    matches(value: string): boolean;
}
