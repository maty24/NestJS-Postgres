import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  imports: [AuthModule, TypeOrmModule.forFeature([Product, ProductImage])], //le sigo que mape o cre la tabla de product
  exports: [ProductsService, TypeOrmModule], //para exportat el modulo y lo puedan usar otros modulos
})
export class ProductsModule {}
