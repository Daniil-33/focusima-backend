import { AccessRule, IAccessRuleInput, AccessRuleEffect } from './access-rule';

export class AllowRule extends AccessRule {
    private readonly _effect = AccessRuleEffect.Allow;

    constructor(props: IAccessRuleInput) {
        super(props);
    }

    get effect(): AccessRuleEffect {
        return this._effect;
    }

    public canAccess(value: string): boolean {
        return this.condition.matches(value);
    }
}
