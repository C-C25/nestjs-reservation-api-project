import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "../auth.service";
import { UsersService } from "../../users/users.service";
import { Reflector } from "@nestjs/core";
import { IS_PUBLIC_KEY } from "../../common/decorator/is_public.decoreator";

@Injectable()
export class BearerTokenGuard implements CanActivate {
    constructor(
        private readonly authService: AuthService,
        private readonly usersService: UsersService
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest();

        const rawToken = req.headers.authorization;

        const token = this.authService.extractTokenFromHeader(rawToken, true);

        const verifyToken = this.authService.accessVerifyToken(token);

        const user = await this.usersService.findByEmail(verifyToken.email);

        req.user = user;
        req.token = token;
        req.tokenPayload = verifyToken;

        return true;
    }
}

@Injectable()
export class AccessTokenGuard extends BearerTokenGuard {
    constructor(
        authService: AuthService,
        usersService: UsersService,
        private readonly reflector: Reflector,
    ) {
        super(authService, usersService)
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride(
            IS_PUBLIC_KEY,
            [
                context.getHandler(),
                context.getClass(),
            ],
        );


        if (isPublic) return true;

        await super.canActivate(context);

        const req = context.switchToHttp().getRequest();

        if (req.tokenPayload.tokenType !== 'access') {
            throw new UnauthorizedException("올바른 토큰이 아닙니다.");
        };

        return true;
    }
}

@Injectable()
export class RefreshTokenGuard extends BearerTokenGuard {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        await super.canActivate(context);

        const req = context.switchToHttp().getRequest();

        if (req.tokenPayload.tokenType !== "refresh") {
            throw new UnauthorizedException("올바른 토큰이 아닙니다.");
        };

        return true;
    }
}