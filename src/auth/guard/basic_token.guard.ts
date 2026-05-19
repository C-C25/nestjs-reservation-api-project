import { BadRequestException, CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { AuthService } from "../auth.service";

@Injectable()
export class BasicTokenGuard implements CanActivate {
    constructor(
        private readonly authService: AuthService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest()

        const rawToken = req.headers.authorization;

        const token = this.authService.extractTokenFromHeader(rawToken, false)

        const verifyToken = this.authService.docodedBasicToken(token);

        const user = await this.authService.authenticateWithEmailAndPassword(verifyToken);

        req.user = user;

        return true;
    }
}
