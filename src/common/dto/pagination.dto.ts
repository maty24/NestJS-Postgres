import { Type } from 'class-transformer';
import { IsOptional, IsPositive, Min } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @IsPositive()
  @Type(() => Number) //convierte el strin en numero
  limit?: number;

  @IsOptional()
  @Min(0)
  @Type(() => Number) //convierte el strin en numero
  offset?: number;
}
