import { ApiProperty } from "@nestjs/swagger";
import { IsHexadecimal, IsNotEmpty, IsString, Length, MinLength } from "class-validator";


export class SetPasswordDto {
    @ApiProperty({ description: 'Token de convite recebido por email (64 chars hex).' })
    @IsString()
    @IsNotEmpty({ message: 'Token é campo obrigatório' })
    @IsHexadecimal({ message: 'Token inválido' })
    @Length(64, 64, { message: 'Token inválido' })
    token: string;

    @ApiProperty({ description: 'Nova senha (mínimo 8 caracteres).' })
    @IsString()
    @IsNotEmpty({ message: 'Senha é campo obrigatório' })
    @MinLength(8, { message: 'A senha deve ter no mínimo 8 caracteres' })
    password: string;
}
