// ORM Entity для AccessRuleState (TypeORM)
import {
    Entity,
    PrimaryColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
} from 'typeorm';
import { AccessRuleOrmEntity } from './access-rule.orm-entity';

@Entity('access_rule_states')
@Index(['ruleId', 'scopeType', 'scopeId'], { unique: true }) // Уникальное состояние для каждого scope
export class AccessRuleStateOrmEntity {
    @PrimaryColumn('uuid')
    id: string;

    @Column({ type: 'uuid', name: 'rule_id' })
    ruleId: string;

    @Column({ type: 'varchar', length: 50, name: 'scope_type' })
    scopeType: string; // 'Global' | 'User' | 'Group'

    @Column({ type: 'varchar', length: 255, name: 'scope_id', nullable: true })
    scopeId: string | null; // null для Global, userId или groupId

    @Column({ type: 'boolean', name: 'is_enabled', default: false })
    isEnabled: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    // Relations
    @ManyToOne(() => AccessRuleOrmEntity, (rule) => rule.states, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'rule_id' })
    rule: AccessRuleOrmEntity;
}
