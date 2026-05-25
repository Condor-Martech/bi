import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidObjectIdException extends HttpException {
    constructor(id: string) {
        super(`ID inválido: ${id}`, HttpStatus.BAD_REQUEST);
    }
}
