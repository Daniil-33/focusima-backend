// Use Case - получение профиля текущего пользователя
import { Injectable } from '@nestjs/common';
import { User } from '../../entities/user.entity';

export interface GetCurrentUserInput {
    user: User; // Пользователь из JWT (уже валидирован)
}

@Injectable()
export class GetCurrentUserUseCase {
    execute(input: GetCurrentUserInput): Promise<User> {
        return new Promise((resolve) => {
            // Просто возвращаем данные пользователя из JWT
            resolve(input.user);
        });
    }
}
