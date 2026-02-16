import { AccessRuleState } from './access-rule-state';
import { AccessRuleStateScope } from './access-rule-state-scope.vo';

export class BlockRuleState extends AccessRuleState {
    constructor(props: {
        id?: string;
        ruleId: string;
        scope: AccessRuleStateScope;
        isEnabled: boolean;
        createdAt?: Date;
        updatedAt?: Date;
    }) {
        super(props);
    }
}
