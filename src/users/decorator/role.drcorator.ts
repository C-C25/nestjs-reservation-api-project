import { SetMetadata } from "@nestjs/common";
import { RoleEnum } from "../const/roles.enum.const";

export const ROLE_KEY = "user_role";

export const Role = (data: RoleEnum) => SetMetadata(ROLE_KEY, data);