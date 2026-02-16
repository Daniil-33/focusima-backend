// Mapper: ORM Entity ↔ Domain Entity
import { User } from '../../../core/entities/user.entity';
import { UserOrmEntity } from '../entities/user.orm-entity';

export class UserMapper {
    // ORM Entity → Domain Entity
    static toDomain(ormEntity: UserOrmEntity): User {
        return new User({
            id: ormEntity.id,
            name: ormEntity.name,
            email: ormEntity.email,
            password: ormEntity.password,
            createdAt: ormEntity.createdAt,
            updatedAt: ormEntity.updatedAt,
        });
    }

    // Domain Entity → ORM Entity
    static toOrm(domain: User): UserOrmEntity {
        const ormEntity = new UserOrmEntity();
        ormEntity.id = domain.id;
        ormEntity.name = domain.name;
        ormEntity.email = domain.email;
        ormEntity.password = domain.passwordHash;
        ormEntity.createdAt = domain.createdAt;
        ormEntity.updatedAt = domain.updatedAt;
        return ormEntity;
    }

    // Partial Domain → Partial ORM (для обновлений)
    static toOrmPartial(domain: Partial<User>): Partial<UserOrmEntity> {
        const partial: Partial<UserOrmEntity> = {};
        if (domain.name !== undefined) partial.name = domain.name;
        if (domain.email !== undefined) partial.email = domain.email;
        if (domain.updatedAt !== undefined) partial.updatedAt = domain.updatedAt;
        return partial;
    }
}
