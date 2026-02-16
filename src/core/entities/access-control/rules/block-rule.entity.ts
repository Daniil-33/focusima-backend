import { AccessRule, IAccessRule, AccessRuleEffect } from './access-rule';

export class BlockRule extends AccessRule {
    private readonly _effect = AccessRuleEffect.Block;

    constructor(props: IAccessRule) {
        super(props);
    }

    get effect(): AccessRuleEffect {
        return this._effect;
    }

    public canAccess(value: string): boolean {
        return !this.condition.matches(value);
    }
}
