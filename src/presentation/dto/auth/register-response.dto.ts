// DTO для ответа при регистрации
import { UserResponseDto } from '../user/user-response.dto';
import { TokenResponseDto } from './token-response.dto';

export class RegisterResponseDto {
    user: UserResponseDto;
    tokens: TokenResponseDto;

    constructor(data: { user: UserResponseDto; tokens: TokenResponseDto }) {
        this.user = data.user;
        this.tokens = data.tokens;
    }
}
