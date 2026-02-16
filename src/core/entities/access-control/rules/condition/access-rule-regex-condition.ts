import { AccessRuleMatchCondition, AccessRuleType } from './access-rule-match-condition';

export class AccessRuleRegexCondition implements AccessRuleMatchCondition {
    readonly type = AccessRuleType.Regex;

    private _pattern: string;

    constructor(pattern: string) {
        this._pattern = pattern;
    }

    matches(value: string): boolean {
        const regex = new RegExp(this._pattern);
        return regex.test(value);
    }
}
