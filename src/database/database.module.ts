import { Global, Module } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm'; // 👈 import
import config from '../config';

@Global()
@Module({
  imports: [
    //esto es un modulo
    TypeOrmModule.forRootAsync({
      // 👈 use TypeOrmModule
      inject: [config.KEY],
      useFactory: (configService: ConfigType<typeof config>) => {
        const { user, host, dbName, password, port } = configService.postgres;
        return {
          type: 'postgres',
          host,
          port,
          username: user,
          password,
          database: dbName,
          synchronize: false, //para que las tablas se actulizaen en la bd
          autoLoadEntities: true, //para que las entidades de autohagan,
        };
      },
    }),
  ],
  exports: [TypeOrmModule], //para que cada modulo lo puede usar
})
export class DatabaseModule {}
