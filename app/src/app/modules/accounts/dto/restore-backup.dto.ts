import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, Matches } from "class-validator";

export class RestoreBackupDto {
    @ApiProperty({
        description: 'Nome do arquivo de backup a restaurar (use GET /accounts/backups para listar).',
        example: 'backup_2026-05-22T03-00-00-123Z.bson.gz',
    })
    @IsString()
    @IsNotEmpty()
    @Matches(/^(backup|prerestore)_[\w.\-:]+\.bson\.gz$/, { message: 'fileName inválido.' })
    fileName: string;
}
