// Реализация репозитория (In-Memory для примера)
import { Injectable } from '@nestjs/common';
import { User } from '../../../core/entities/user.entity';
import { IUserRepository } from '../../../core/repositories/user.repository.interface';

@Injectable()
export class UserRepository implements IUserRepository {
    // Временное хранилище (in-memory)
    // В реальном приложении здесь будет TypeORM, Prisma или другая ORM
    private users: Map<string, User> = new Map();

    create(user: User): Promise<User> {
        this.users.set(user.id, user);
        return Promise.resolve(user);
    }

    findById(id: string): Promise<User | null> {
        return Promise.resolve(this.users.get(id) || null);
    }

    findByEmail(email: string): Promise<User | null> {
        const users = Array.from(this.users.values());
        return Promise.resolve(users.find((user) => user.email === email.toLowerCase()) || null);
    }

    findAll(): Promise<User[]> {
        return Promise.resolve(Array.from(this.users.values()));
    }

    update(id: string, updatedUser: User): Promise<User> {
        this.users.set(id, updatedUser);
        return Promise.resolve(updatedUser);
    }

    delete(id: string): Promise<void> {
        this.users.delete(id);
        return Promise.resolve();
    }

    async exists(email: string): Promise<boolean> {
        const user = await this.findByEmail(email);
        return !!user;
    }
}
