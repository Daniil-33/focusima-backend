// DTO для ответа (без пароля!)
import { User } from '../../../core/entities/user.entity';

export class UserResponseDto {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;

    static fromEntity(user: User): UserResponseDto {
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
}
