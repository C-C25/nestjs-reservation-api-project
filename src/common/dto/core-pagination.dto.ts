import { IsIn, IsNumber, IsOptional } from "class-validator";

export class CorePaginationDto {
    @IsNumber()
    @IsOptional()
    page?: number;

    @IsNumber()
    @IsOptional()
    where__id__more_than?: number;

    @IsNumber()
    @IsOptional()
    where__id__less_than?: number;

    @IsIn(["ASC", "DESC"])
    order__id: "ASC" | "DESC" = "ASC";

    @IsNumber()
    @IsOptional()
    take: number = 20;
}