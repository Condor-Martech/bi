import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

export class UpdatePassDto {
    @ApiProperty({ description: 'Email cadastrado do usuário', example: 'joao.silva@empresa.com' })
    @IsEmail()
    @IsNotEmpty({
        message: 'Email é campo obrigatório'
    })
    email: string;
    @ApiProperty({ description: 'Nova senha do usuário. Nunca exponha senhas reais.', example: 'SenhaForte123' })
    @IsNotEmpty({
        message: 'Senha é campo obrigatório'
    })
    password: string;
}