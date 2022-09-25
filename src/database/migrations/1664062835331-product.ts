import { MigrationInterface, QueryRunner } from "typeorm";

export class product1664062835331 implements MigrationInterface {
    name = 'product1664062835331'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "product" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" text NOT NULL, "price" double precision NOT NULL DEFAULT '0', "description" text, "slug" text NOT NULL, "stock" integer NOT NULL DEFAULT '0', "sizes" text array NOT NULL, "gender" text NOT NULL, "tags" text array NOT NULL DEFAULT '{}', CONSTRAINT "UQ_f7bf944ad9f1034110e8c2133ab" UNIQUE ("title"), CONSTRAINT "UQ_8cfaf4a1e80806d58e3dbe69224" UNIQUE ("slug"), CONSTRAINT "PK_bebc9158e480b949565b4dc7a82" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "product"`);
    }

}
