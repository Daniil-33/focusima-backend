// DTO для ответа с токенами
export class TokenResponseDto {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: string;

    constructor(data: {
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
        tokenType: string;
    }) {
        this.accessToken = data.accessToken;
        this.refreshToken = data.refreshToken;
        this.expiresIn = data.expiresIn;
        this.tokenType = data.tokenType;
    }
}
