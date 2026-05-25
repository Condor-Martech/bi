import { ApiProperty } from '@nestjs/swagger';

export class CreateMapDto {

    @ApiProperty({
        description: 'Nome de exibição do mapa.',
        example: 'Mapa de Vendas por Região',
    })
    name: string;

    @ApiProperty({
        description: 'URL pública de acesso ao arquivo de mapa enviado.',
        example: 'https://api.example.com/maps/1717000000000.png',
    })
    webUrl: string;
}
