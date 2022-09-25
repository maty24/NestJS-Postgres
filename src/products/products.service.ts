import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { validate as isUUID } from 'uuid';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ProductImage, Product } from './entities';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService'); //para ver los errores

  constructor(
    @InjectRepository(Product) //injectamos nuestra entidad
    private readonly productRepository: Repository<Product>, //el patron repository es que se encarga de las interacciones con la bd
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource, //sabe la configuracion de nuestros repositorios
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      const { images = [], ...productDetails } = createProductDto; //pongo el nombre que quiero en operador ...rest
      //tenemos todos los atributos y crea la instancia de los productos
      const product = this.productRepository.create({
        ...productDetails, //operador spread
        images: images.map(
          (image) => this.productImageRepository.create({ url: image }), //el id producto sera el mismo id y el url va ser igual al image
        ),
      });
      await this.productRepository.save(product); //para que me guarde el porducto en la bd
      return product;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto; //le pongo limit y offset numero por defectos ni no vienen
    const product = await this.productRepository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true, // es el nombre de la relacion , es el mismo nombre que puse en el entity
      },
    });
    return product.map((product) => ({
      ...product,
      images: product.images.map((img) => img.url), //solo me traiga el url de estas y no el id
    }));
  }

  async findOne(term: string) {
    let product: Product;

    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term }); //el id tiene que ser igual al term que le estoy enviando. el id es el nombre que tengo en la bd
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder('prod'); //esto es para crear una query
      product = await queryBuilder //obtengo los productos
        .where('UPPER(title) =:title or slug =:slug', {
          //los : son argumentos que le voy a poner el where
          //hago el filtro con el where
          title: term.toUpperCase(), //el titulo sera igual al parametro que le envio desde term
          slug: term.toLowerCase(),
        })
        .leftJoinAndSelect('prod.images', 'prodImages') //leftjoin de las imagenes y el segundo es un alias, si ocupamos querybluider se pone lefJOin
        .getOne(); //solo que regrese uno de los dos
    }

    if (!product) throw new NotFoundException(`Product with ${term} not found`);

    return product;
  }

  //para buscar por id o slug una forma mas simple
  async findOnePlain(term: string) {
    const { images = [], ...rest } = await this.findOne(term);
    return {
      ...rest,
      images: images.map((img) => img.url),
    };
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const { images, ...toUpdate } = updateProductDto; //saco lo que nececito del updatePorductDto

    const product = await this.productRepository.preload({
      //
      id, //va a buscar el id en la bd
      ...toUpdate, //va a reemplazar el producto
    });
    if (!product)
      throw new NotFoundException(`Product with id: ${id} not found`);

    //Create query runner
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (images) {
        await queryRunner.manager.delete(ProductImage, { product: { id } }); //el id que esta es del producto para no borrar todas las img
        product.images = images.map((img) =>
          this.productImageRepository.create({ url: img }),
        );
      }

      await queryRunner.manager.save(product);
      //await this.productRepository.save(product); //guarda el nuevo producto

      await queryRunner.commitTransaction();
      await queryRunner.release(); //esto hace que el query runner deje de funcionar

      return this.findOnePlain(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
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
