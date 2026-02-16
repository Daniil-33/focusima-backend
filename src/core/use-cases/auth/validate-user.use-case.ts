// Use Case - валидация JWT токена и получение пользователя
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '../../entities/user.entity';
import type { IUserRepository } from '../../repositories/user.repository.interface';
import { USER_REPOSITORY } from '../../repositories/user.repository.interface';

export interface ValidateUserInput {
    userId: string;
}

@Injectable()
export class ValidateUserUseCase {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: IUserRepository,
    ) {}

    async execute(input: ValidateUserInput): Promise<User> {
        // Получаем пользователя по ID из JWT payload
        const user = await this.userRepository.findById(input.userId);

        if (!user) {
            throw new UnauthorizedException('User not found or token is invalid');
        }

        // Можно добавить дополнительные проверки:
        // - Пользователь не заблокирован
        // - Email подтверждён
        // - Роль активна
        // etc.

        return user;
    }
}
