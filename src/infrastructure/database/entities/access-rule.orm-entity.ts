// ORM Entity для AccessRule (TypeORM)
import {
    Entity,
    PrimaryColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    OneToMany,
} from 'typeorm';
import { UserOrmEntity } from './user.orm-entity';
import { AccessRuleStateOrmEntity } from './access-rule-state.orm-entity';

@Entity('access_rules')
export class AccessRuleOrmEntity {
    @PrimaryColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 100, unique: true })
    name: string;

    @Column({ type: 'varchar', length: 500 })
    description: string;

    @Column({ type: 'varchar', length: 20 })
    effect: string; // 'Allow' | 'Block'

    // JSONB для хранения condition (List или Regex)
    @Column({ type: 'jsonb' })
    condition: {
        type: string; // 'List' | 'Regex'
        values?: string[]; // для List
        pattern?: string; // для Regex
    };

    @Column({ type: 'uuid', name: 'created_by_user_id' })
    createdByUserId: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    // Relations
    @ManyToOne(() => UserOrmEntity, { nullable: false })
    @JoinColumn({ name: 'created_by_user_id' })
    createdByUser: UserOrmEntity;

    @OneToMany(() => AccessRuleStateOrmEntity, (state) => state.rule, {
        cascade: true,
    })
    states: AccessRuleStateOrmEntity[];
}
