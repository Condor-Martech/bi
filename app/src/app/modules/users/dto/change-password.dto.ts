import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MinLength } from "class-validator";


export class ChangePasswordDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty({
        message: 'Senha atual é campo obrigatório'
    })
    currentPassword: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty({
        message: 'Nova senha é campo obrigatório'
    })
    @MinLength(8, {
        message: 'A nova senha deve ter no mínimo 8 caracteres'
    })
    newPassword: string;
}
