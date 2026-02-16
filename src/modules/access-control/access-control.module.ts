// Access Control Module - регистрация всех компонентов
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// ORM Entities
import { AccessRuleOrmEntity } from '../../infrastructure/database/entities/access-rule.orm-entity';
import { AccessRuleStateOrmEntity } from '../../infrastructure/database/entities/access-rule-state.orm-entity';

// Mappers
import { AccessRuleMapper } from '../../infrastructure/database/mappers/access-rule.mapper';
import { AccessRuleStateMapper } from '../../infrastructure/database/mappers/access-rule-state.mapper';

// Factory
import { AccessRuleConditionFactory } from '../../infrastructure/factories/access-rule-condition.factory';

// Presentation Mapper
import { AccessRuleResponseMapper } from '../../presentation/mappers/access-rule-response.mapper';

// Repository
import { TypeOrmAccessRuleRepository } from '../../infrastructure/database/repositories/typeorm-access-rule.repository';
import { ACCESS_RULE_REPOSITORY } from '../../core/repositories/access-control/access-rule.repository.interface';

// Use Cases
import {
    CreateAccessRuleUseCase,
    GetAccessRuleUseCase,
    GetAllAccessRulesUseCase,
    UpdateAccessRuleUseCase,
    DeleteAccessRuleUseCase,
    EnableAccessRuleUseCase,
    DisableAccessRuleUseCase,
    GetEnabledRulesForUserUseCase,
    GetRuleStatesUseCase,
    CheckAccessUseCase,
} from '../../core/use-cases/access-control';

// Controller
import { AccessControlController } from '../../presentation/controllers/access-control.controller';

@Module({
    imports: [
        // Регистрируем ORM entities для TypeORM
        TypeOrmModule.forFeature([AccessRuleOrmEntity, AccessRuleStateOrmEntity]),
    ],
    controllers: [AccessControlController],
    providers: [
        // Mappers
        AccessRuleMapper,
        AccessRuleStateMapper,
        AccessRuleResponseMapper,

        // Factory
        AccessRuleConditionFactory,

        // Repository
        {
            provide: ACCESS_RULE_REPOSITORY,
            useClass: TypeOrmAccessRuleRepository,
        },

        // Use Cases
        CreateAccessRuleUseCase,
        GetAccessRuleUseCase,
        GetAllAccessRulesUseCase,
        UpdateAccessRuleUseCase,
        DeleteAccessRuleUseCase,
        EnableAccessRuleUseCase,
        DisableAccessRuleUseCase,
        GetEnabledRulesForUserUseCase,
        GetRuleStatesUseCase,
        CheckAccessUseCase,
    ],
    exports: [
        // Экспортируем use-cases для использования в других модулях
        CheckAccessUseCase,
        GetEnabledRulesForUserUseCase,
    ],
})
export class AccessControlModule {}
