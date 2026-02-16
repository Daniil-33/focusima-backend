// Доменное исключение
export class AccessRuleAlreadyExistsException extends Error {
    constructor(name: string) {
        super(`Access rule with name "${name}" already exists`);
        this.name = 'AccessRuleAlreadyExistsException';
    }
}
