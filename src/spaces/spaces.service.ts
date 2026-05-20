import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Code, Repository } from 'typeorm';
import { SpacesEntity } from './entities/spaces.entity';
import { CreateSpaceDto } from './dto/create_space.dto';
import { UpdateSpacesDto } from './dto/update.spaces.dto';
import { CommonService } from '../common/common.service';
import { SpacesPagianteDto } from './dto/spaces-paginate.dto';

@Injectable()
export class SpacesService {
    constructor(
        @InjectRepository(SpacesEntity)
        private readonly spaceRepo: Repository<SpacesEntity>,
        private readonly commonService: CommonService,
    ) { }

    async spacePaginate(dto: SpacesPagianteDto) {
        return this.commonService.pagiante(
            dto,
            this.spaceRepo,
            {

            },
            "spaces"
        )
    }

    async createSpace(userId: number, dto: CreateSpaceDto) {
        const space = this.spaceRepo.create({
            ...dto,
            owner: {
                id: userId,
            }
        });

        const newSpace = await this.spaceRepo.save(space);

        return newSpace;
    }


    async findOneSpaces(id: number) {
        const space = await this.spaceRepo.findOne({
            where: {
                id,
            },
        });

        if (!space) {
            throw new NotFoundException("정보를 찾을수 없습니다.");
        };

        return space;
    }

    async updateSpaces(spaceId: number, dto: UpdateSpacesDto) {
        const space = await this.spaceRepo.findOne({
            where: {
                id: spaceId,
            },
        });

        if (!space) {
            throw new NotFoundException("정보를 찾을수 없습니다.");
        }

        for (const key of Object.keys(dto)) {
            if (dto[key] !== undefined) {
                space[key] = dto[key]
            }
        }

        const newSpace = await this.spaceRepo.save(space)

        return newSpace;
    }

    async removeSpaces(id: number) {
        const space = await this.spaceRepo.findOne({
            where: { id },
        });

        if (!space) {
            throw new NotFoundException("정보를 찾을수 없습니다.");
        }

        await this.spaceRepo.softDelete(id)

        return id;
    }

}
