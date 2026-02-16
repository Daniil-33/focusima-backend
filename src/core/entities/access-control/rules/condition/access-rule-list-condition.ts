import { AccessRuleMatchCondition, AccessRuleType } from './access-rule-match-condition';

export class AccessRuleListCondition implements AccessRuleMatchCondition {
    readonly type = AccessRuleType.List;

    private _values: string[];

    constructor(values: string[]) {
        this._values = values;
    }

    matches(value: string): boolean {
        return this._values.includes(value);
    }
}
