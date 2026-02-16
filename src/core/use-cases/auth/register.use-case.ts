// Use Case - регистрация нового пользователя
import { Injectable } from '@nestjs/common';
import { User } from '../../entities/user.entity';
import { CreateUserUseCase } from '../user/create-user.use-case';
import { LoginUseCase, TokenResponse } from './login.use-case';

export interface RegisterInput {
    name: string;
    email: string;
    password: string;
}

export interface RegisterResponse {
    user: User;
    tokens: TokenResponse;
}

@Injectable()
export class RegisterUseCase {
    constructor(
        private readonly createUserUseCase: CreateUserUseCase,
        private readonly loginUseCase: LoginUseCase,
    ) {}

    async execute(input: RegisterInput): Promise<RegisterResponse> {
        // 1. Создаём пользователя через существующий use-case
        const user = await this.createUserUseCase.execute({
            name: input.name,
            email: input.email,
            password: input.password,
        });

        // 2. Сразу логиним пользователя (генерируем JWT токены)
        const tokens = await this.loginUseCase.execute({
            email: input.email,
            password: input.password,
        });

        return {
            user,
            tokens,
        };
    }
}
