import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

import { validate as isUUID } from 'uuid';
import { Product } from './entities/product.entity';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product) //injectamos nuestra entidad
    private readonly productRepository: Repository<Product>, //el patron repository es que se encarga de las interacciones con la bd
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      const product = this.productRepository.create(createProductDto); //tenemos todos los atributos y crea la instancia de los productos
      await this.productRepository.save(product); //para que me guarde el porducto en la bd

      return product;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto; //obtengo los limit o el offser de pagiantion dto, si no vienen le envio los datos por defecto

    return this.productRepository.find({
      take: limit,
      skip: offset,
      // TODO: relaciones
    });
  }

  async findOne(term: string) {
    let product: Product;

    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term }); //el id tiene que ser igual al term que le estoy enviando. el id es el nombre que tengo en la bd
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder(); //esto es para crear una query
      product = await queryBuilder //obtengo los productos
        .where('UPPER(title) =:title or slug =:slug', {
          //los : son argumentos que le voy a poner el where
          //hago el filtro con el where
          title: term.toUpperCase(), //el titulo sera igual al parametro que le envio desde term
          slug: term.toLowerCase(),
        })
        .getOne(); //solo que regrese uno de los dos
    }

    if (!product) throw new NotFoundException(`Product with ${term} not found`);

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.productRepository.preload({
      id: id,
      ...updateProductDto,
    });

    if (!product)
      throw new NotFoundException(`Product with id: ${id} not found`);

    try {
      await this.productRepository.save(product);
      return product;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }

  private handleDBExceptions(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    this.logger.error(error);
    // console.log(error)
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }
}
