// TypeORM Repository Implementation
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../core/entities/user.entity';
import { IUserRepository } from '../../../core/repositories/user.repository.interface';
import { UserOrmEntity } from '../entities/user.orm-entity';
import { UserMapper } from '../mappers/user.mapper';

@Injectable()
export class TypeOrmUserRepository implements IUserRepository {
    constructor(
        @InjectRepository(UserOrmEntity)
        private readonly repository: Repository<UserOrmEntity>,
    ) {}

    async create(user: User): Promise<User> {
        const ormEntity = UserMapper.toOrm(user);
        const saved = await this.repository.save(ormEntity);
        return UserMapper.toDomain(saved);
    }

    async findById(id: string): Promise<User | null> {
        const ormEntity = await this.repository.findOne({
            where: { id },
        });
        return ormEntity ? UserMapper.toDomain(ormEntity) : null;
    }

    async findByEmail(email: string): Promise<User | null> {
        const ormEntity = await this.repository.findOne({
            where: { email: email.toLowerCase() },
        });
        return ormEntity ? UserMapper.toDomain(ormEntity) : null;
    }

    async findAll(): Promise<User[]> {
        const ormEntities = await this.repository.find();
        return ormEntities.map((entity) => UserMapper.toDomain(entity));
    }

    async update(id: string, user: User): Promise<User> {
        const ormEntity = UserMapper.toOrm(user);
        await this.repository.update(id, ormEntity);
        const updated = await this.repository.findOne({ where: { id } });
        if (!updated) {
            throw new Error('User not found after update');
        }
        return UserMapper.toDomain(updated);
    }

    async delete(id: string): Promise<void> {
        await this.repository.delete(id);
    }

    async exists(email: string): Promise<boolean> {
        const count = await this.repository.count({
            where: { email: email.toLowerCase() },
        });
        return count > 0;
    }
}
