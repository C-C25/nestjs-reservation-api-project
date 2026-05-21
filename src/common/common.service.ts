import { BadRequestException, Injectable } from '@nestjs/common';
import { CorePaginationDto } from './dto/core-pagination.dto';
import {
  FindManyOptions,
  FindOptionsOrder,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { CoreEntity } from './entities/core.entity';
import { FILTER_MAPPER } from './const/filter_mapper.const';

@Injectable()
export class CommonService {
  pagiante<T extends CoreEntity>(
    dto: CorePaginationDto,
    repository: Repository<T>,
    overrideFindOptions: FindManyOptions<T> = {},
    path: string,
  ) {
    if (dto.page !== undefined) {
      return this.pagePaginate<T>(dto, repository, overrideFindOptions);
    } else {
      return this.cursorPaginte<T>(dto, repository, overrideFindOptions, path);
    }
  }

  private async pagePaginate<T extends CoreEntity>(
    dto: CorePaginationDto,
    repository: Repository<T>,
    overrideFindOptions: FindManyOptions<T> = {},
  ) {
    const take = dto.take ?? 20;
    const page = dto.page ?? 1;
    const offset = take * (page - 1);

    const where = this.parseWhereFilters<T>(dto);
    const order = this.parseOrderFilters<T>(dto);

    const [data, count] = await repository.findAndCount({
      where,
      order,
      take,
      skip: offset,
      ...overrideFindOptions,
    });

    const totalPage = Math.ceil(count / take);
    const hasNextPage = page < totalPage;

    return {
      data,
      meta: {
        page,
        totalPage,
        total: count,
        hasNextPage,
      },
    };
  }

  private async cursorPaginte<T extends CoreEntity>(
    dto: CorePaginationDto,
    repository: Repository<T>,
    overrideFindOptions: FindManyOptions<T> = {},
    path: string,
  ) {
    const take = dto.take ?? 20;

    const where = this.parseWhereFilters<T>(dto);
    const order = this.parseOrderFilters<T>(dto);

    const result = await repository.find({
      where,
      order,
      take,
      ...overrideFindOptions,
    });

    const lastItem =
      result.length > 0 && result.length === take
        ? result[result.length - 1]
        : null;

    const nextUrl = lastItem && new URL(`http://localhost:3000/${path}`);

    if (nextUrl) {
      for (const key of Object.keys(dto)) {
        if (dto[key]) {
          if (
            key !== 'where__id__more_than' &&
            key !== 'where__id__less_than'
          ) {
            nextUrl?.searchParams.append(key, dto[key]);
          }
        }
      }

      let key: 'where__id__more_than' | 'where__id__less_than';
      if (dto.order__id === 'ASC') {
        key = 'where__id__more_than';
      } else {
        key = 'where__id__less_than';
      }

      nextUrl.searchParams.append(key, lastItem.id.toString());
    }

    return {
      data: result,
      cursor: {
        after: lastItem?.id ?? null,
      },
      take: result.length,
      next: nextUrl?.toString() ?? null,
    };
  }

  private parseWhereFilters<T extends CoreEntity>(
    dto: CorePaginationDto,
  ): FindOptionsWhere<T> {
    const where: FindOptionsWhere<T> = {};

    for (const [key, value] of Object.entries(dto)) {
      if (!key.startsWith('where__')) continue;
      if (value === undefined || value === null) continue;

      Object.assign(where, this.parseWhereFilter<T>(key, value));
    }

    return where;
  }

  private parseOrderFilters<T extends CoreEntity>(
    dto: CorePaginationDto,
  ): FindOptionsOrder<T> {
    const order: FindOptionsOrder<T> = {};

    for (const [key, value] of Object.entries(dto)) {
      if (!key.startsWith('order__')) continue;
      if (value === undefined || value === null) continue;

      Object.assign(order, this.parseOrderFilter<T>(key, value));
    }

    if (Object.keys(order).length === 0) {
      (order as Record<string, any>).id = 'DESC';
    }

    return order;
  }

  private parseWhereFilter<T extends CoreEntity>(
    key: string,
    value: unknown,
  ): FindOptionsWhere<T> {
    const result: Record<string, any> = {};
    const split = key.split('__');

    if (split.length !== 3) {
      throw new BadRequestException(
        `where필터는 where__필드명__연산자 로 구성 되어야 합니다. 문제되는 키값: ${key}`,
      );
    }

    const [_, field, operator] = split;

    const filterMapper = FILTER_MAPPER[operator];

    if (!filterMapper) {
      throw new BadRequestException(
        `${operator}(은)는 아직 지원하지 않습니다.`,
      );
    }

    if (operator === 'i_like') {
      result[field] = filterMapper(`%${value}%`);
    } else {
      result[field] = filterMapper(value);
    }

    return result as FindOptionsWhere<T>;
  }

  private parseOrderFilter<T extends CoreEntity>(
    key: string,
    value: unknown,
  ): FindOptionsOrder<T> {
    const result: Record<string, any> = {};
    const split = key.split('__');

    if (split.length !== 2) {
      throw new BadRequestException(
        `order 필터는 order__필드명 으로 구성 되어야 합니다. 문제 되는 키값: ${key}}`,
      );
    }

    const [_, field] = split;

    result[field] = value;

    return result as FindOptionsOrder<T>;
  }
}
