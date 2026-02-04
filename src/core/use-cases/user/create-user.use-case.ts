// Use Case - бизнес-логика создания пользователя
import { Inject, Injectable } from '@nestjs/common';
import { User } from '../../entities/user.entity';
import type { IUserRepository } from '../../repositories/user.repository.interface';
import { USER_REPOSITORY } from '../../repositories/user.repository.interface';
import { UserAlreadyExistsException } from '../../exceptions/user/user-already-exists.exception';

export interface CreateUserInput {
    name: string;
    email: string;
    password: string;
}

@Injectable()
export class CreateUserUseCase {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: IUserRepository,
    ) {}

    async execute(input: CreateUserInput): Promise<User> {
        // Проверяем, существует ли пользователь с таким email
        const existingUser = await this.userRepository.findByEmail(input.email);

        if (existingUser) {
            throw new UserAlreadyExistsException(input.email);
        }

        // Создаём доменную сущность
        const user = new User({
            name: input.name,
            email: input.email.toLowerCase(),
            password: input.password, // В реальном приложении здесь должно быть хеширование
        });

        // Сохраняем через репозиторий
        return await this.userRepository.create(user);
    }
}
