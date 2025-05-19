import { Catch, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { BaseRpcExceptionFilter, RpcException } from '@nestjs/microservices';

@Catch()
export class AllRpcExceptionsFilter extends BaseRpcExceptionFilter {
  private readonly logger = new Logger(AllRpcExceptionsFilter.name);

  catch(exception: any): Observable<any> {
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof HttpException ? exception.message : 'Internal server error in microservice';

    this.logger.error('Error in Microservice:', exception); // 실제 프로덕션에서는 Logger 사용 권장

    // RpcException 형태로 Gateway에 전달
    return throwError(() => new RpcException({ result: 'fail', status, message }));
  }
}
