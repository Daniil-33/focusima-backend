// DTO для обновления правила доступа
import { IsString, MinLength, MaxLength, IsEnum, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { AccessRuleEffect } from '../../../core/entities/access-control/rules/access-rule';
import { ConditionDto } from './create-access-rule.dto';

export class UpdateAccessRuleDto {
    @IsOptional()
    @IsString()
    @MinLength(2, { message: 'Name must be at least 2 characters long' })
    @MaxLength(100, { message: 'Name must not exceed 100 characters' })
    name?: string;

    @IsOptional()
    @IsString()
    @MinLength(10, { message: 'Description must be at least 10 characters long' })
    @MaxLength(500, { message: 'Description must not exceed 500 characters' })
    description?: string;

    @IsOptional()
    @IsEnum(AccessRuleEffect)
    effect?: AccessRuleEffect;

    @IsOptional()
    @ValidateNested()
    @Type(() => ConditionDto)
    condition?: ConditionDto;
}
