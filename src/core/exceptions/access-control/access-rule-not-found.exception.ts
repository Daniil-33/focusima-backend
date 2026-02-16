// Exception - правило доступа не найдено
import { NotFoundException } from '@nestjs/common';

export class AccessRuleNotFoundException extends NotFoundException {
    constructor(ruleId: string) {
        super(`Access rule with ID "${ruleId}" not found`);
    }
}
