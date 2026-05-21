import { createParamDecorator, ExecutionContext, InternalServerErrorException } from "@nestjs/common";

export const QueryRunner = createParamDecorator((data, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();

    if (!req.queryRunner) {
        throw new InternalServerErrorException(
            `Query Runner Decoratior를 사용 하려면 트랜젝션 데코레이터를 적용해야 합니다.`
        );
    }

    return req.queryRunner;
}) 