// Use Case - обновление пользователя
import { Inject, Injectable } from '@nestjs/common';
import { User } from '../../entities/user.entity';
import type { IUserRepository } from '../../repositories/user.repository.interface';
import { USER_REPOSITORY } from '../../repositories/user.repository.interface';
import { UserNotFoundException } from '../../exceptions/user/user-not-found.exception';

export interface UpdateUserInput {
    name?: string;
    email?: string;
    newPassword?: string;
    oldPassword?: string;
}

@Injectable()
export class UpdateUserUseCase {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: IUserRepository,
    ) {}

    async execute(id: string, input: UpdateUserInput): Promise<User> {
        // Получаем существующего пользователя
        const user = await this.userRepository.findById(id);

        if (!user) {
            throw new UserNotFoundException(id);
        }

        // Применяем бизнес-логику обновления
        if (input.name) {
            user.updateName(input.name);
        }

        if (input.email) {
            // Проверяем, не занят ли новый email
            const existingUser = await this.userRepository.findByEmail(input.email);
            if (existingUser && existingUser.id !== id) {
                throw new Error(`Email ${input.email} is already taken`);
            }
            user.updateEmail(input.email);
        }

        if (input.newPassword && input.oldPassword) {
            const hashedOldPasswrod = user.hashPassword(input.oldPassword);

            if (user.passwordHash !== hashedOldPasswrod) {
                throw new Error('Old password is incorrect');
            }

            user.updatePassword(input.newPassword);
        } else if (input.newPassword || input.oldPassword) {
            throw new Error('Both oldPassword and newPassword are required to update the password');
        }

        // Сохраняем изменения
        return await this.userRepository.update(id, user);
    }
}
