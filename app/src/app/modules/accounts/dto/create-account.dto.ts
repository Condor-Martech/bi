import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class CreateAccountDto {
    @ApiProperty({ description: 'Nome de identificação da conta BI no sistema', example: 'Conta BI Corporativa' })
    @IsNotEmpty({
        message: 'Nome é campo obrigatório'
    })
    nameAccount: string;

    @ApiProperty({ description: 'E-mail Azure AD usado para autenticação no Power BI', example: 'bi@empresa.onmicrosoft.com' })
    @IsEmail()
    @IsNotEmpty({
        message: 'email é campo obrigatório'
    })
    email: string;

    @ApiProperty({ description: 'Senha da conta Azure AD (armazenada criptografada)', example: 'SenhaForte@123' })
    @IsNotEmpty({
        message: 'Senha é campo obrigatório'
    })
    pass: string;

    @ApiProperty({ description: 'Client ID do aplicativo registrado no Azure AD', example: '1sa25d1sa2-da36-4e08-866e-94701efe7192' })
    @IsNotEmpty({
        message: 'Client ID é campo obrigatório'
    })
    clientId: string;

    @ApiProperty({ description: 'Client Secret do aplicativo registrado no Azure AD', example: 'abc~defg~HIJKLMN01234567890' })
    @IsNotEmpty({
        message: 'Client Secret é campo obrigatório'
    })
    clientSecret: string;

    @ApiProperty({ description: 'Tenant ID do diretório Azure AD', example: '27cc7714-ecb3-407d-8115-da53f624c6da' })
    @IsNotEmpty({
        message: 'Tenant ID é campo obrigatório'
    })
    tenantId: string;

    token?: string;
    refreshToken?: string;
    expiresIn?: string;
    expiresOn?: string;
}

export class AccountResponseDto {
    @ApiProperty({ description: 'Nome de identificação da conta BI', example: 'Conta BI Corporativa' })
    @IsString()
    nameAccount: string;

    @ApiProperty({ description: 'E-mail Azure AD da conta', example: 'bi@empresa.onmicrosoft.com' })
    @IsString()
    email: string;

    @ApiProperty({ description: 'Client ID do aplicativo Azure AD', example: '1sa25d1sa2-da36-4e08-866e-94701efe7192' })
    @IsString()
    clientId: string;

    @ApiProperty({ description: 'Tenant ID do diretório Azure AD', example: '27cc7714-ecb3-407d-8115-da53f624c6da' })
    @IsString()
    tenantId: string;

    @ApiProperty({ description: 'Token de acesso OAuth2 atual para chamadas ao Power BI', example: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...' })
    token: string;

    @ApiProperty({ description: 'Refresh token OAuth2 usado para renovar o access token', example: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...' })
    refreshToken: string;

    @ApiProperty({ description: 'Validade do token em segundos a partir da emissão', example: '3600' })
    expiresIn: string;

    @ApiProperty({ description: 'Data/hora de expiração do token (epoch ou ISO)', example: '1719426793' })
    expiresOn: string;

    @ApiProperty({ description: 'Lista de IDs dos usuários vinculados à conta', example: ['6685a57d6dddeaa56c4a5f15'] })
    users: string[];
}


export class AccountRelatedResponseDto {
    @ApiProperty({ description: 'ID MongoDB da conta BI', example: '6685a57d6dddeaa56c4a5f15' })
    @IsString()
    id: string;

    @ApiProperty({ description: 'Nome de identificação da conta BI', example: 'Conta BI Corporativa' })
    @IsString()
    nameAccount: string;

    @ApiProperty({ description: 'E-mail Azure AD da conta', example: 'bi@empresa.onmicrosoft.com' })
    @IsString()
    email: string;

    @ApiProperty({ description: 'Token de acesso OAuth2 atual para chamadas ao Power BI', example: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...' })
    @IsString()
    token: string;
}
