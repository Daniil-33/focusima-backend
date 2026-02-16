// TypeORM реализация репозитория для AccessRule
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { IAccessRuleRepository } from '../../../core/repositories/access-control/access-rule.repository.interface';
import { AccessRule } from '../../../core/entities/access-control/rules/access-rule';
import { AccessRuleState } from '../../../core/entities/access-control/rules-state/access-rule-state';
import { AccessRuleStateScope } from '../../../core/entities/access-control/rules-state/access-rule-state-scope.vo';
import { AccessRuleOrmEntity } from '../entities/access-rule.orm-entity';
import { AccessRuleStateOrmEntity } from '../entities/access-rule-state.orm-entity';
import { AccessRuleMapper } from '../mappers/access-rule.mapper';
import { AccessRuleStateMapper } from '../mappers/access-rule-state.mapper';

@Injectable()
export class TypeOrmAccessRuleRepository implements IAccessRuleRepository {
    constructor(
        @InjectRepository(AccessRuleOrmEntity)
        private readonly ruleRepository: Repository<AccessRuleOrmEntity>,
        @InjectRepository(AccessRuleStateOrmEntity)
        private readonly stateRepository: Repository<AccessRuleStateOrmEntity>,
        private readonly ruleMapper: AccessRuleMapper,
        private readonly stateMapper: AccessRuleStateMapper,
        private readonly dataSource: DataSource,
    ) {}

    // === CRUD операции для правил ===

    async create(rule: AccessRule): Promise<AccessRule> {
        const ormEntity = this.ruleMapper.toOrm(rule);
        const saved = await this.ruleRepository.save(ormEntity);
        return this.ruleMapper.toDomain(saved);
    }

    async findById(id: string): Promise<AccessRule | null> {
        const ormEntity = await this.ruleRepository.findOne({ where: { id } });
        return ormEntity ? this.ruleMapper.toDomain(ormEntity) : null;
    }

    async findByName(name: string): Promise<AccessRule | null> {
        const ormEntity = await this.ruleRepository.findOne({ where: { name } });
        return ormEntity ? this.ruleMapper.toDomain(ormEntity) : null;
    }

    async findAll(): Promise<AccessRule[]> {
        const ormEntities = await this.ruleRepository.find();
        return this.ruleMapper.toDomainArray(ormEntities);
    }

    async findByCreator(creatorId: string): Promise<AccessRule[]> {
        const ormEntities = await this.ruleRepository.find({
            where: { createdByUserId: creatorId },
        });
        return this.ruleMapper.toDomainArray(ormEntities);
    }

    async update(rule: AccessRule): Promise<AccessRule> {
        const ormEntity = this.ruleMapper.toOrm(rule);
        const saved = await this.ruleRepository.save(ormEntity);
        return this.ruleMapper.toDomain(saved);
    }

    async delete(id: string): Promise<void> {
        await this.ruleRepository.delete(id);
    }

    // === CRUD операции для состояний ===

    async createState(state: AccessRuleState): Promise<AccessRuleState> {
        const ormEntity = this.stateMapper.toOrm(state);
        const saved = await this.stateRepository.save(ormEntity);
        return this.stateMapper.toDomain(saved);
    }

    async findStateById(id: string): Promise<AccessRuleState | null> {
        const ormEntity = await this.stateRepository.findOne({ where: { id } });
        return ormEntity ? this.stateMapper.toDomain(ormEntity) : null;
    }

    async findStatesByRuleId(ruleId: string): Promise<AccessRuleState[]> {
        const ormEntities = await this.stateRepository.find({
            where: { ruleId },
        });
        return this.stateMapper.toDomainArray(ormEntities);
    }

    async findStateByScope(scope: AccessRuleStateScope): Promise<AccessRuleState[]> {
        const ormEntities = await this.stateRepository.find({
            where: {
                scopeType: scope.type,
                scopeId: scope.id,
            },
        });
        return this.stateMapper.toDomainArray(ormEntities);
    }

    async updateState(state: AccessRuleState): Promise<AccessRuleState> {
        const ormEntity = this.stateMapper.toOrm(state);
        const saved = await this.stateRepository.save(ormEntity);
        return this.stateMapper.toDomain(saved);
    }

    async deleteState(id: string): Promise<void> {
        await this.stateRepository.delete(id);
    }

    // === Бизнес-методы ===

    async createRuleWithState(
        rule: AccessRule,
        state: AccessRuleState,
    ): Promise<{ rule: AccessRule; state: AccessRuleState }> {
        // Используем транзакцию для атомарности
        return await this.dataSource.transaction(async (manager) => {
            // Сохраняем правило
            const ruleOrm = this.ruleMapper.toOrm(rule);
            const savedRuleOrm = await manager.save(AccessRuleOrmEntity, ruleOrm);
            const savedRule = this.ruleMapper.toDomain(savedRuleOrm);

            // Сохраняем состояние
            const stateOrm = this.stateMapper.toOrm(state);
            const savedStateOrm = await manager.save(AccessRuleStateOrmEntity, stateOrm);
            const savedState = this.stateMapper.toDomain(savedStateOrm);

            return { rule: savedRule, state: savedState };
        });
    }

    async findEnabledStatesByRuleId(ruleId: string): Promise<AccessRuleState[]> {
        const ormEntities = await this.stateRepository.find({
            where: {
                ruleId,
                isEnabled: true,
            },
        });
        return this.stateMapper.toDomainArray(ormEntities);
    }

    async findByRuleIdAndScope(
        ruleId: string,
        scope: AccessRuleStateScope,
    ): Promise<AccessRuleState | null> {
        const ormEntity = await this.stateRepository.findOne({
            where: {
                ruleId,
                scopeType: scope.type,
                scopeId: scope.id,
            },
        });
        return ormEntity ? this.stateMapper.toDomain(ormEntity) : null;
    }

    async findEnabledRulesByScope(scope: AccessRuleStateScope): Promise<AccessRule[]> {
        // JOIN states с rules для получения включенных правил для scope
        const ormEntities = await this.ruleRepository
            .createQueryBuilder('rule')
            .innerJoin('rule.states', 'state')
            .where('state.scopeType = :scopeType', { scopeType: scope.type })
            .andWhere('state.scopeId = :scopeId', { scopeId: scope.id })
            .andWhere('state.isEnabled = :isEnabled', { isEnabled: true })
            .getMany();

        return this.ruleMapper.toDomainArray(ormEntities);
    }
}
