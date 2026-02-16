// DTO для создания правила доступа
import { IsString, MinLength, MaxLength, IsEnum, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AccessRuleEffect } from '../../../core/entities/access-control/rules/access-rule';

// DTO для condition
export class ConditionDto {
    @IsEnum(['List', 'Regex'])
    type: 'List' | 'Regex';

    @IsObject()
    data: {
        values?: string[]; // для List
        pattern?: string; // для Regex
    };
}

export class CreateAccessRuleDto {
    @IsString()
    @MinLength(2, { message: 'Name must be at least 2 characters long' })
    @MaxLength(100, { message: 'Name must not exceed 100 characters' })
    name: string;

    @IsString()
    @MinLength(10, { message: 'Description must be at least 10 characters long' })
    @MaxLength(500, { message: 'Description must not exceed 500 characters' })
    description: string;

    @IsEnum(AccessRuleEffect)
    effect: AccessRuleEffect;

    @ValidateNested()
    @Type(() => ConditionDto)
    condition: ConditionDto;
}
