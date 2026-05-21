import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateSpaceDto {
  @IsString()
  title!: string;

  @IsString()
  content!: string;

  @IsString()
  address!: string;

  @IsString()
  contact!: string;

  @IsNumber()
  pricePerHour!: number;

  @IsNumber()
  maxCapacity!: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}
