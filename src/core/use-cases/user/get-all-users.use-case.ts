// Use Case - получение всех пользователей
import { Inject, Injectable } from '@nestjs/common';
import { User } from '../../entities/user.entity';
import type { IUserRepository } from '../../repositories/user.repository.interface';
import { USER_REPOSITORY } from '../../repositories/user.repository.interface';

@Injectable()
export class GetAllUsersUseCase {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: IUserRepository,
    ) {}

    async execute(): Promise<User[]> {
        return await this.userRepository.findAll();
    }
}
