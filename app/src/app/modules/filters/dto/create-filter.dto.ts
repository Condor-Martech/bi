import { ApiProperty } from '@nestjs/swagger';

export class CreateFilterDto {

    @ApiProperty({
        description: 'Nome da tabela do dataset Power BI à qual o filtro pertence.',
        example: 'DimCliente',
    })
    table: string;

    @ApiProperty({
        description: 'Nome da coluna da tabela utilizada como critério de filtragem.',
        example: 'Estado',
    })
    column: string;

    @ApiProperty({
        description: 'Valores aplicados como filtro na coluna.',
        example: 'SP',
    })
    value: string;

    @ApiProperty({
        description: 'ID (ObjectId) do usuário dono deste filtro.',
        example: '64a1c2e8f3a4b50012d3e001',
    })
    userId: string;

}
