// User Feature Module
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from '../../presentation/controllers/user.controller';
import { TypeOrmUserRepository } from '../../infrastructure/database/repositories/typeorm-user.repository';
import { USER_REPOSITORY } from '../../core/repositories/user.repository.interface';
import { CreateUserUseCase } from '../../core/use-cases/user/create-user.use-case';
import { GetUserUseCase } from '../../core/use-cases/user/get-user.use-case';
import { GetAllUsersUseCase } from '../../core/use-cases/user/get-all-users.use-case';
import { UpdateUserUseCase } from '../../core/use-cases/user/update-user.use-case';
import { DeleteUserUseCase } from '../../core/use-cases/user/delete-user.use-case';
import { UserOrmEntity } from '../../infrastructure/database/entities/user.orm-entity';

@Module({
    imports: [TypeOrmModule.forFeature([UserOrmEntity])],
    controllers: [UserController],
    providers: [
        // Repository implementation (TypeORM)
        {
            provide: USER_REPOSITORY,
            useClass: TypeOrmUserRepository,
        },
        // Use Cases
        CreateUserUseCase,
        GetUserUseCase,
        GetAllUsersUseCase,
        UpdateUserUseCase,
        DeleteUserUseCase,
    ],
    exports: [
        USER_REPOSITORY,
        CreateUserUseCase,
        GetUserUseCase,
        GetAllUsersUseCase,
        UpdateUserUseCase,
        DeleteUserUseCase,
    ],
})
export class UserModule {}
