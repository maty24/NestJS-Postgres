import { DataSource } from 'typeorm';

//el data source es para que typeORM puede hacer la migracion

export const connectionSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'root',
  password: '1234',
  database: 'demopg',
  logging: true,
  synchronize: false,
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
});

//yarn migration:generate src/database/migrations/init --> comando base para generar la migracion
//yarn m:run --> comando para ejecutar las tablas creadas
