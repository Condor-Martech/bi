import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsISO8601, IsOptional, IsString } from "class-validator";

export class ListUsersDto {
    @ApiPropertyOptional({ description: 'Busca por nome, email ou ISLV (case-insensitive)', example: 'silva' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ description: 'Filtra por role', enum: ['manager', 'admin', 'user'] })
    @IsOptional()
    @IsIn(['manager', 'admin', 'user'])
    role?: string;

    @ApiPropertyOptional({ description: 'Último login a partir de (ISO 8601)', example: '2026-05-01T00:00:00.000Z' })
    @IsOptional()
    @IsISO8601()
    lastLoginFrom?: string;

    @ApiPropertyOptional({ description: 'Último login até (ISO 8601)', example: '2026-05-31T23:59:59.999Z' })
    @IsOptional()
    @IsISO8601()
    lastLoginTo?: string;
}
