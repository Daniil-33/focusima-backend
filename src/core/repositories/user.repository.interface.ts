// Repository Interface (Port) - определяет контракт для работы с пользователями
import { User } from '../entities/user.entity';

export interface IUserRepository {
    create(user: User): Promise<User>;
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findAll(): Promise<User[]>;
    update(id: string, user: Partial<User>): Promise<User>;
    delete(id: string): Promise<void>;
    exists(email: string): Promise<boolean>;
}

// Token для Dependency Injection в NestJS
export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
