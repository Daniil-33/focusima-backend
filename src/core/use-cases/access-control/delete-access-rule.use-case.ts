// Use Case - удаление правила доступа
import { Inject, Injectable } from '@nestjs/common';
import type { IAccessRuleRepository } from 'src/core/repositories/access-control/access-rule.repository.interface';
import { ACCESS_RULE_REPOSITORY } from 'src/core/repositories/access-control/access-rule.repository.interface';
import { AccessRuleNotFoundException } from 'src/core/exceptions/access-control/access-rule-not-found.exception';

export interface DeleteAccessRuleInput {
    ruleId: string;
    userId: string; // Для проверки прав доступа
}

@Injectable()
export class DeleteAccessRuleUseCase {
    constructor(
        @Inject(ACCESS_RULE_REPOSITORY)
        private readonly accessRuleRepository: IAccessRuleRepository,
    ) {}

    async execute(input: DeleteAccessRuleInput): Promise<void> {
        // Проверяем существование правила
        const rule = await this.accessRuleRepository.findById(input.ruleId);

        if (!rule) {
            throw new AccessRuleNotFoundException(input.ruleId);
        }

        // Опционально: проверка прав доступа
        // if (rule.createdBy !== input.userId) {
        //     throw new UnauthorizedException('You can only delete your own rules');
        // }

        // Удаляем правило (каскадно удалятся и все states благодаря FK)
        await this.accessRuleRepository.delete(input.ruleId);
    }
}
