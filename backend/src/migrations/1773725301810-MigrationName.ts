import { MigrationInterface, QueryRunner } from "typeorm";

export class MigrationName1773725301810 implements MigrationInterface {
    name = 'MigrationName1773725301810'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`assets\` (\`asset_id\` int NOT NULL AUTO_INCREMENT, \`asset_uuid\` varchar(36) NOT NULL, \`asset_type\` varchar(100) NOT NULL, \`asset_name\` varchar(255) NOT NULL, \`asset_size\` int NOT NULL, \`asset_config\` json NULL, \`asset_project_id\` int NOT NULL, \`asset_created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`asset_updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), INDEX \`ix_asset_type\` (\`asset_type\`), INDEX \`ix_asset_project_id\` (\`asset_project_id\`), UNIQUE INDEX \`IDX_6200c4b3857405ac5bfd672c21\` (\`asset_uuid\`), PRIMARY KEY (\`asset_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`chunks\` (\`chunk_id\` int NOT NULL AUTO_INCREMENT, \`chunk_uuid\` varchar(36) NOT NULL, \`chunk_text\` text NOT NULL, \`chunkMetadata\` json NULL, \`chunk_order\` int NOT NULL, \`chunk_project_id\` int NOT NULL, \`chunk_asset_id\` int NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), INDEX \`ix_chunk_asset_id\` (\`chunk_asset_id\`), INDEX \`ix_chunk_project_id\` (\`chunk_project_id\`), UNIQUE INDEX \`IDX_1f883f6e7142dc0db13b01a405\` (\`chunk_uuid\`), PRIMARY KEY (\`chunk_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`projects\` (\`project_id\` int NOT NULL AUTO_INCREMENT, \`project_uuid\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_b2c40732593ef21ab67d4e012e\` (\`project_uuid\`), PRIMARY KEY (\`project_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`assets\` ADD CONSTRAINT \`FK_690647395de367316a5852227f3\` FOREIGN KEY (\`asset_project_id\`) REFERENCES \`projects\`(\`project_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`chunks\` ADD CONSTRAINT \`FK_ab1b0e8506c34f890cad5c439de\` FOREIGN KEY (\`chunk_project_id\`) REFERENCES \`projects\`(\`project_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`chunks\` ADD CONSTRAINT \`FK_6b31d40b49d51c830396775646b\` FOREIGN KEY (\`chunk_asset_id\`) REFERENCES \`assets\`(\`asset_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`chunks\` DROP FOREIGN KEY \`FK_6b31d40b49d51c830396775646b\``);
        await queryRunner.query(`ALTER TABLE \`chunks\` DROP FOREIGN KEY \`FK_ab1b0e8506c34f890cad5c439de\``);
        await queryRunner.query(`ALTER TABLE \`assets\` DROP FOREIGN KEY \`FK_690647395de367316a5852227f3\``);
        await queryRunner.query(`DROP INDEX \`IDX_b2c40732593ef21ab67d4e012e\` ON \`projects\``);
        await queryRunner.query(`DROP TABLE \`projects\``);
        await queryRunner.query(`DROP INDEX \`IDX_1f883f6e7142dc0db13b01a405\` ON \`chunks\``);
        await queryRunner.query(`DROP INDEX \`ix_chunk_project_id\` ON \`chunks\``);
        await queryRunner.query(`DROP INDEX \`ix_chunk_asset_id\` ON \`chunks\``);
        await queryRunner.query(`DROP TABLE \`chunks\``);
        await queryRunner.query(`DROP INDEX \`IDX_6200c4b3857405ac5bfd672c21\` ON \`assets\``);
        await queryRunner.query(`DROP INDEX \`ix_asset_project_id\` ON \`assets\``);
        await queryRunner.query(`DROP INDEX \`ix_asset_type\` ON \`assets\``);
        await queryRunner.query(`DROP TABLE \`assets\``);
    }

}
