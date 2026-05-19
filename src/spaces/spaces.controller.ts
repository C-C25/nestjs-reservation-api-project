import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Request } from '@nestjs/common';
import { SpacesService } from './spaces.service';
import { CreateSpaceDto } from './dto/create_space.dto';
import { RoleEnum } from '../users/const/roles.enum.const';
import { Role } from '../users/decorator/role.drcorator';
import { IsPublic } from '../common/decorator/is_public.decoreator';
import { UpdateSpacesDto } from './dto/update.spaces.dto';

@Controller('spaces')
export class SpacesController {
  constructor(private readonly spacesService: SpacesService) { }

  @Get(":id")
  @IsPublic()
  getSpace(
    @Param("id", ParseIntPipe) id: number,
  ) {
    return this.spacesService.findOneSpaces(id);
  }

  @Post()
  @Role(RoleEnum.ADMIN)
  createSpace(
    @Body() dto: CreateSpaceDto,
    @Request() req,
  ) {
    return this.spacesService.createSpace(req.user.id, dto);
  }

  @Patch(":id")
  @Role(RoleEnum.ADMIN)
  patchSpace(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateSpacesDto,
  ) {
    return this.spacesService.updateSpaces(id, dto);
  }

  @Delete(":id")
  @Role(RoleEnum.ADMIN)
  deleteSpace(
    @Param("id", ParseIntPipe) id: number,
  ) {
    return this.spacesService.removeSpaces(id);
  }
}
