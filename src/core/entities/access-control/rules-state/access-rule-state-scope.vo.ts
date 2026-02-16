export enum AccessRuleStateScopeType {
    User = 'User',
    Group = 'Group',
    Global = 'Global',
}

export interface AccessRuleStateScope {
    type: AccessRuleStateScopeType;
    id: string | null; // null для Global scope
}
