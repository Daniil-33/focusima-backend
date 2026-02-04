// Domain Entity - чистая бизнес-модель пользователя
import { randomUUID } from 'crypto';

export class User {
    private readonly _id: string;
    private _name: string;
    private _email: string;
    private _passwordHash: string;
    private readonly _createdAt: Date;
    private _updatedAt: Date;

    constructor(props: {
        id?: string;
        name: string;
        email: string;
        password: string;
        createdAt?: Date;
        updatedAt?: Date;
    }) {
        this._id = props.id || this.generateId();
        this._name = props.name;
        this._email = props.email;
        this._passwordHash = this.hashPassword(props.password);
        this._createdAt = props.createdAt || new Date();
        this._updatedAt = props.updatedAt || new Date();

        this.validate();
    }

    // Getters
    get id(): string {
        return this._id;
    }

    get name(): string {
        return this._name;
    }

    get email(): string {
        return this._email;
    }

    get passwordHash(): string {
        return this._passwordHash;
    }

    get createdAt(): Date {
        return this._createdAt;
    }

    get updatedAt(): Date {
        return this._updatedAt;
    }

    // Business methods
    hashPassword(password: string): string {
        // Здесь должно быть реальное хеширование пароля
        return `hashed_${password}`;
    }

    updateName(name: string): void {
        if (!name || name.trim().length < 2) {
            throw new Error('Name must be at least 2 characters long');
        }
        this._name = name.trim();
        this._updatedAt = new Date();
    }

    updateEmail(email: string): void {
        if (!this.isValidEmail(email)) {
            throw new Error('Invalid email format');
        }
        this._email = email.toLowerCase();
        this._updatedAt = new Date();
    }

    updatePassword(password: string): void {
        if (!password || password.length < 8) {
            throw new Error('Password must be at least 8 characters long');
        }

        this._passwordHash = this.hashPassword(password);
        this._updatedAt = new Date();
    }

    // Validation
    private validate(): void {
        if (!this._name || this._name.trim().length < 2) {
            throw new Error('Name must be at least 2 characters long');
        }

        if (!this.isValidEmail(this._email)) {
            throw new Error('Invalid email format');
        }
    }

    private isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    private generateId(): string {
        return randomUUID();
    }

    // Для сериализации (без пароля)
    toJSON() {
        return {
            id: this._id,
            name: this._name,
            email: this._email,
            createdAt: this._createdAt,
            updatedAt: this._updatedAt,
        };
    }
}
