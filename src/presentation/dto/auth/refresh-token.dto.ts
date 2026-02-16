// DTO для обновления токена
import { IsString } from 'class-validator';

export class RefreshTokenDto {
    @IsString()
    refreshToken: string;
}
