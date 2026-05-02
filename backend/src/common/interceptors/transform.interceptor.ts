import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  statusCode: number;
}

/**
 * TransformInterceptor
 * Wraps every successful response in:
 * {
 *   success: true,
 *   statusCode: 200,
 *   message: "Success",
 *   data: <original response>
 * }
 */
@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((data) => {
        // If the controller returned an explicit shape with `message`, hoist it
        const message = data?.message || 'Success';
        const payload = data?.message ? data?.data ?? data : data;

        return {
          success: true,
          statusCode: response.statusCode,
          message,
          data: payload,
        };
      }),
    );
  }
}
