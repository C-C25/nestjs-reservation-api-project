import { PartialType } from "@nestjs/mapped-types";
import { CreateSpaceDto } from "./create_space.dto";

export class UpdateSpacesDto extends PartialType(CreateSpaceDto) {

}