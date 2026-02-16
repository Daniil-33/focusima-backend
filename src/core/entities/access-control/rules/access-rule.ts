// Domain Entity - чистая бизнес-модель пользователя
import { randomUUID } from 'crypto';
import { AccessRuleMatchCondition } from './condition/access-rule-match-condition';

export enum AccessRuleEffect {
    Allow = 'allow',
    Block = 'block',
}

export interface IAccessRuleInput {
    id?: string;
    name: string;
    description: string;
    condition: AccessRuleMatchCondition;
    createdByUserId: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export class AccessRule {
    private readonly _id: string;
    private readonly _createdAt: Date;

    private _createdByUserId: string;
    private _name: string;
    private _description: string;
    private _updatedAt: Date;
    private _condition: AccessRuleMatchCondition;

    constructor(props: IAccessRuleInput) {
        this._id = props.id || this.generateId();
        this._name = props.name;
        this._condition = props.condition;
        this._description = props.description;
        this._createdAt = props.createdAt || new Date();
        this._updatedAt = props.updatedAt || new Date();
        this._createdByUserId = props.createdByUserId;

        this.validate();
    }

    // Getters
    get id(): string {
        return this._id;
    }

    get name(): string {
        return this._name;
    }

    get condition(): AccessRuleMatchCondition {
        return this._condition;
    }

    get description(): string {
        return this._description;
    }

    get createdAt(): Date {
        return this._createdAt;
    }

    get updatedAt(): Date {
        return this._updatedAt;
    }

    get createdByUserId(): string {
        return this._createdByUserId;
    }

    // Business methods

    // Абстрактный метод - должен быть реализован в конкретных правилах (AllowRule, BlockRule)
    canAccess(value: string): boolean {
        throw new Error('Method canAccess must be implemented in subclasses, value: ' + value);
    }

    updateName(name: string): void {
        if (!name || name.trim().length < 2) {
            throw new Error('Name must be at least 2 characters long');
        }

        this._name = name.trim();
        this._updatedAt = new Date();
    }

    updateDescription(description: string): void {
        this._description = description.trim();
        this._updatedAt = new Date();
    }

    updateCondition(condition: AccessRuleMatchCondition): void {
        if (!condition) {
            throw new Error('Condition is required');
        }

        this._condition = condition;
        this._updatedAt = new Date();
    }

    // Validation
    private validate(): void {
        if (!this._name || this._name.trim().length < 2) {
            throw new Error('Name must be at least 2 characters long');
        }

        if (!this._condition) {
            throw new Error('Condition is required');
        }

        if (!this._createdByUserId) {
            throw new Error('CreatedByUserId is required');
        }
    }

    private generateId(): string {
        return randomUUID();
    }

    // Для сериализации (без пароля)
    toJSON() {
        return {
            id: this._id,
            name: this._name,
            condition: this._condition,
            description: this._description,
            createdAt: this._createdAt,
            updatedAt: this._updatedAt,
            createdByUserId: this._createdByUserId,
        };
    }
}
