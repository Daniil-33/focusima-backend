import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAccessControlTables1739313600000 implements MigrationInterface {
    name = 'CreateAccessControlTables1739313600000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Создаём таблицу access_rules
        await queryRunner.query(`
            CREATE TABLE "access_rules" (
                "id" uuid NOT NULL,
                "name" character varying(100) NOT NULL,
                "description" character varying(500) NOT NULL,
                "effect" character varying(20) NOT NULL,
                "condition" jsonb NOT NULL,
                "created_by_user_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_access_rules_name" UNIQUE ("name"),
                CONSTRAINT "PK_access_rules" PRIMARY KEY ("id")
            )
        `);

        // Создаём таблицу access_rule_states
        await queryRunner.query(`
            CREATE TABLE "access_rule_states" (
                "id" uuid NOT NULL,
                "rule_id" uuid NOT NULL,
                "scope_type" character varying(50) NOT NULL,
                "scope_id" character varying(255),
                "is_enabled" boolean NOT NULL DEFAULT false,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_access_rule_states" PRIMARY KEY ("id")
            )
        `);

        // Создаём индекс для быстрого поиска состояний по rule_id
        await queryRunner.query(`
            CREATE INDEX "IDX_access_rule_states_rule_id" 
            ON "access_rule_states" ("rule_id")
        `);

        // Создаём уникальный индекс для предотвращения дублирования состояний
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_access_rule_states_unique_scope" 
            ON "access_rule_states" ("rule_id", "scope_type", "scope_id")
        `);

        // Добавляем внешний ключ для created_by_user_id
        await queryRunner.query(`
            ALTER TABLE "access_rules" 
            ADD CONSTRAINT "FK_access_rules_user" 
            FOREIGN KEY ("created_by_user_id") 
            REFERENCES "users"("id") 
            ON DELETE RESTRICT 
            ON UPDATE NO ACTION
        `);

        // Добавляем внешний ключ для rule_id
        await queryRunner.query(`
            ALTER TABLE "access_rule_states" 
            ADD CONSTRAINT "FK_access_rule_states_rule" 
            FOREIGN KEY ("rule_id") 
            REFERENCES "access_rules"("id") 
            ON DELETE CASCADE 
            ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Удаляем внешние ключи
        await queryRunner.query(`
            ALTER TABLE "access_rule_states" 
            DROP CONSTRAINT "FK_access_rule_states_rule"
        `);
        await queryRunner.query(`
            ALTER TABLE "access_rules" 
            DROP CONSTRAINT "FK_access_rules_user"
        `);

        // Удаляем индексы
        await queryRunner.query(`DROP INDEX "IDX_access_rule_states_unique_scope"`);
        await queryRunner.query(`DROP INDEX "IDX_access_rule_states_rule_id"`);

        // Удаляем таблицы
        await queryRunner.query(`DROP TABLE "access_rule_states"`);
        await queryRunner.query(`DROP TABLE "access_rules"`);
    }
}
