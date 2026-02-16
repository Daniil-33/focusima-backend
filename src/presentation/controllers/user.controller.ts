// REST контроллер для работы с пользователями
import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';

import { CreateUserDto } from '../dto/user/create-user.dto';
import { UpdateUserDto } from '../dto/user/update-user.dto';
import { UserResponseDto } from '../dto/user/user-response.dto';

import { CreateUserUseCase } from '../../core/use-cases/user/create-user.use-case';
import { GetUserUseCase } from '../../core/use-cases/user/get-user.use-case';
import { GetAllUsersUseCase } from '../../core/use-cases/user/get-all-users.use-case';
import { UpdateUserUseCase } from '../../core/use-cases/user/update-user.use-case';
import { DeleteUserUseCase } from '../../core/use-cases/user/delete-user.use-case';

@Controller('users')
export class UserController {
    constructor(
        private readonly createUserUseCase: CreateUserUseCase,
        private readonly getUserUseCase: GetUserUseCase,
        private readonly getAllUsersUseCase: GetAllUsersUseCase,
        private readonly updateUserUseCase: UpdateUserUseCase,
        private readonly deleteUserUseCase: DeleteUserUseCase,
    ) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
        const user = await this.createUserUseCase.execute(createUserDto);
        return UserResponseDto.fromEntity(user);
    }

    @Get()
    async findAll(): Promise<UserResponseDto[]> {
        const users = await this.getAllUsersUseCase.execute();
        return users.map((user) => UserResponseDto.fromEntity(user));
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<UserResponseDto> {
        const user = await this.getUserUseCase.execute(id);
        return UserResponseDto.fromEntity(user);
    }

    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body() updateUserDto: UpdateUserDto,
    ): Promise<UserResponseDto> {
        const user = await this.updateUserUseCase.execute(id, updateUserDto);
        return UserResponseDto.fromEntity(user);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id') id: string): Promise<void> {
        await this.deleteUserUseCase.execute(id);
    }
}
