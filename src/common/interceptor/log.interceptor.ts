import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LogInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    const nowData = new Date();

    const req = context.switchToHttp().getRequest();

    const path = req.originalUrl;

    console.log(`[REQ] ${path} ${nowData.toLocaleString('kr')}`);

    return next
      .handle()
      .pipe(
        tap((observable) =>
          console.log(
            `[REQ] ${path} ${new Date().toLocaleString('kr')} ${new Date().getMilliseconds() - nowData.getMilliseconds()}ms`,
          ),
        ),
      );
  }
}
