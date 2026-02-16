// Domain Entity - чистая бизнес-модель пользователя
import { randomUUID } from 'crypto';
import { AccessRuleStateScope } from './access-rule-state-scope.vo';

export class AccessRuleState {
    private readonly _id: string;
    private readonly _createdAt: Date;
    private _ruleId: string;
    private _scope: AccessRuleStateScope;
    private _isEnabled: boolean;
    private _updatedAt: Date;

    constructor(props: {
        id?: string;
        ruleId: string;
        scope: AccessRuleStateScope;
        isEnabled: boolean;
        createdAt?: Date;
        updatedAt?: Date;
    }) {
        this._id = props.id || this.generateId();
        this._ruleId = props.ruleId;
        this._scope = props.scope;
        this._isEnabled = props.isEnabled;
        this._createdAt = props.createdAt || new Date();
        this._updatedAt = props.updatedAt || new Date();

        this.validate();
    }

    // Getters
    get id(): string {
        return this._id;
    }

    get ruleId(): string {
        return this._ruleId;
    }

    get scope(): AccessRuleStateScope {
        return this._scope;
    }

    get isEnabled(): boolean {
        return this._isEnabled;
    }

    get createdAt(): Date {
        return this._createdAt;
    }

    get updatedAt(): Date {
        return this._updatedAt;
    }

    // Business methods
    updateScope(scope: AccessRuleStateScope): void {
        this._scope = scope;
        this._updatedAt = new Date();
    }

    updateIsEnabled(isEnabled: boolean): void {
        this._isEnabled = isEnabled;
        this._updatedAt = new Date();
    }

    // Validation
    private validate(): void {
        if (!this._ruleId) {
            throw new Error('Rule ID is required');
        }

        if (!this._scope) {
            throw new Error('Scope is required');
        }
    }

    private generateId(): string {
        return randomUUID();
    }

    // Для сериализации (без пароля)
    toJSON() {
        return {
            id: this._id,
            ruleId: this._ruleId,
            scope: this._scope,
            isEnabled: this._isEnabled,
            createdAt: this._createdAt,
            updatedAt: this._updatedAt,
        };
    }
}
