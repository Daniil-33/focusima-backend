// Use Case - получение пользователя
import { Inject, Injectable } from '@nestjs/common';
import { User } from '../../entities/user.entity';
import type { IUserRepository } from '../../repositories/user.repository.interface';
import { USER_REPOSITORY } from '../../repositories/user.repository.interface';
import { UserNotFoundException } from '../../exceptions/user/user-not-found.exception';

@Injectable()
export class GetUserUseCase {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: IUserRepository,
    ) {}

    async execute(id: string): Promise<User> {
        const user = await this.userRepository.findById(id);

        if (!user) {
            throw new UserNotFoundException(id);
        }

        return user;
    }
}
