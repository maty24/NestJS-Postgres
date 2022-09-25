import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', {
    unique: true,
  })
  title: string;

  @Column('float', {
    default: 0,
  })
  price: number;

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string;

  @Column('text', {
    unique: true,
  })
  slug: string;

  @Column('int', {
    default: 0,
  })
  stock: number;

  @Column('text', {
    array: true, //es un arreglo de string
  })
  sizes: string[]; //para que mande multiples objetos

  @Column('text')
  gender: string;

  @Column('text', {
    array: true,
    default: [],
  })
  tags: string[];

  // images

  //antes de insertarlo a la bd hace lo soguiente
  @BeforeInsert()
  checkSlugInsert() {
    if (!this.slug) {
      //si no existe entonces lo reemplazas por titulo
      this.slug = this.title;
    }

    this.slug = this.slug //cuando tenemos el slug hace los siguiente
      .toLowerCase()
      .replaceAll(' ', '_')
      .replaceAll("'", '');
  }

  @BeforeUpdate()
  checkSlugUpdate() {
    this.slug = this.slug
      .toLowerCase()
      .replaceAll(' ', '_')
      .replaceAll("'", '');
  }
}
