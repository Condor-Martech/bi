import { InvalidObjectIdException } from './invalid.object';
import { Catch, ExceptionFilter, ArgumentsHost, HttpStatus } from '@nestjs/common';


@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        if (exception instanceof InvalidObjectIdException) {
            const ctx = host.switchToHttp();
            const response = ctx.getResponse();
            const status = HttpStatus.BAD_REQUEST;

            response.status(status).json({
                statusCode: status,
                message: exception.message,
            });
        } else {

        }
    }
}
