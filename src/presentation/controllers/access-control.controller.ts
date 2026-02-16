// REST контроллер для работы с правилами доступа
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
    NotFoundException,
} from '@nestjs/common';

import { CreateAccessRuleDto } from '../dto/access-control/create-access-rule.dto';
import { UpdateAccessRuleDto } from '../dto/access-control/update-access-rule.dto';
import { AccessRuleResponseDto } from '../dto/access-control/access-rule-response.dto';
import { AccessRuleStateResponseDto } from '../dto/access-control/access-rule-state-response.dto';
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
} from 'src/core/use-cases/access-control';
import { CurrentUser } from '../../infrastructure/auth/decorators/current-user.decorator';
import { User } from '../../core/entities/user.entity';
import { AccessRuleConditionFactory } from '../../infrastructure/factories/access-rule-condition.factory';
import { AccessRuleResponseMapper } from '../mappers/access-rule-response.mapper';
import { AccessRuleStateScopeType } from '../../core/entities/access-control/rules-state/access-rule-state-scope.vo';

/*
Эндпоинты:
1) POST /access-control/rules - Создать правило ограничения
2) GET /access-control/rules - Получить все правила
3) GET /access-control/rules/:id - Получить конкретное правило по ID
4) PUT /access-control/rules/:id - Обновить правило
5) DELETE /access-control/rules/:id - Удалить правило
6) PUT /access-control/rules/:id/enable - Включить правило
7) PUT /access-control/rules/:id/disable - Выключить правило
8) GET /access-control/rules/user/:userId/enabled - Получить включенные правила для пользователя
*/

@Controller('access-control')
export class AccessControlController {
    constructor(
        private readonly createAccessRuleUseCase: CreateAccessRuleUseCase,
        private readonly getAccessRuleUseCase: GetAccessRuleUseCase,
        private readonly getAllAccessRulesUseCase: GetAllAccessRulesUseCase,
        private readonly updateAccessRuleUseCase: UpdateAccessRuleUseCase,
        private readonly deleteAccessRuleUseCase: DeleteAccessRuleUseCase,
        private readonly enableAccessRuleUseCase: EnableAccessRuleUseCase,
        private readonly disableAccessRuleUseCase: DisableAccessRuleUseCase,
        private readonly getEnabledRulesForUserUseCase: GetEnabledRulesForUserUseCase,
        private readonly getRuleStatesUseCase: GetRuleStatesUseCase,
        private readonly conditionFactory: AccessRuleConditionFactory,
        private readonly responseMapper: AccessRuleResponseMapper,
    ) {}

    // 1. Создать правило
    @Post('rules')
    @HttpCode(HttpStatus.CREATED)
    async createRule(
        @Body() createAccessRuleDto: CreateAccessRuleDto,
        @CurrentUser() user: User,
    ): Promise<{ message: string; rule: AccessRuleResponseDto }> {
        const condition = this.conditionFactory.createFromDto(createAccessRuleDto.condition);

        const result = await this.createAccessRuleUseCase.execute({
            userId: user.id,
            name: createAccessRuleDto.name,
            description: createAccessRuleDto.description,
            effect: createAccessRuleDto.effect,
            condition,
        });

        return {
            message: 'Access rule created successfully',
            rule: this.responseMapper.toResponseDto(result.rule),
        };
    }

    // 2. Получить все правила
    @Get('rules')
    @HttpCode(HttpStatus.OK)
    async getAllRules(@CurrentUser() user: User): Promise<AccessRuleResponseDto[]> {
        const rules = await this.getAllAccessRulesUseCase.execute({ userId: user.id });
        return this.responseMapper.toResponseDtoArray(rules);
    }

    // 3. Получить правило по ID
    @Get('rules/:id')
    @HttpCode(HttpStatus.OK)
    async getRule(@Param('id') id: string): Promise<AccessRuleResponseDto> {
        const rule = await this.getAccessRuleUseCase.execute({ ruleId: id });

        if (!rule) {
            throw new NotFoundException(`Access rule with ID ${id} not found`);
        }

        return this.responseMapper.toResponseDto(rule);
    }

    // 4. Обновить правило
    @Put('rules/:id')
    @HttpCode(HttpStatus.OK)
    async updateRule(
        @Param('id') id: string,
        @Body() updateAccessRuleDto: UpdateAccessRuleDto,
        @CurrentUser() user: User,
    ): Promise<{ message: string; rule: AccessRuleResponseDto }> {
        // Преобразуем condition если он есть
        const condition = updateAccessRuleDto.condition
            ? this.conditionFactory.createFromDto(updateAccessRuleDto.condition)
            : undefined;

        const updatedRule = await this.updateAccessRuleUseCase.execute({
            ruleId: id,
            userId: user.id,
            name: updateAccessRuleDto.name,
            description: updateAccessRuleDto.description,
            condition,
        });

        return {
            message: 'Access rule updated successfully',
            rule: this.responseMapper.toResponseDto(updatedRule),
        };
    }

    // 5. Удалить правило
    @Delete('rules/:id')
    @HttpCode(HttpStatus.OK)
    async deleteRule(
        @Param('id') id: string,
        @CurrentUser() user: User,
    ): Promise<{ message: string }> {
        await this.deleteAccessRuleUseCase.execute({ ruleId: id, userId: user.id });

        return {
            message: 'Access rule deleted successfully',
        };
    }

    // 6. Включить правило
    @Put('rules/:id/enable')
    @HttpCode(HttpStatus.OK)
    async enableRule(
        @Param('id') id: string,
        @CurrentUser() user: User,
    ): Promise<{ message: string; state: AccessRuleStateResponseDto }> {
        const state = await this.enableAccessRuleUseCase.execute({
            ruleId: id,
            scope: {
                type: AccessRuleStateScopeType.User,
                id: user.id,
            },
            userId: user.id,
        });

        return {
            message: 'Access rule enabled successfully',
            state: this.responseMapper.toStateResponseDto(state),
        };
    }

    // 7. Выключить правило
    @Put('rules/:id/disable')
    @HttpCode(HttpStatus.OK)
    async disableRule(
        @Param('id') id: string,
        @CurrentUser() user: User,
    ): Promise<{ message: string; state: AccessRuleStateResponseDto }> {
        const state = await this.disableAccessRuleUseCase.execute({
            ruleId: id,
            scope: {
                type: AccessRuleStateScopeType.User,
                id: user.id,
            },
            userId: user.id,
        });

        return {
            message: 'Access rule disabled successfully',
            state: this.responseMapper.toStateResponseDto(state),
        };
    }

    // 8. Получить включенные правила для пользователя
    @Get('rules/user/:userId/enabled')
    @HttpCode(HttpStatus.OK)
    async getEnabledRulesForUser(
        @Param('userId') userId: string,
    ): Promise<AccessRuleResponseDto[]> {
        const rules = await this.getEnabledRulesForUserUseCase.execute({ userId });
        return this.responseMapper.toResponseDtoArray(rules);
    }

    // 9. Получить состояния правила
    @Get('rules/:id/states')
    @HttpCode(HttpStatus.OK)
    async getRuleStates(@Param('id') id: string): Promise<AccessRuleStateResponseDto[]> {
        const states = await this.getRuleStatesUseCase.execute({ ruleId: id });
        return this.responseMapper.toStateResponseDtoArray(states);
    }
}


