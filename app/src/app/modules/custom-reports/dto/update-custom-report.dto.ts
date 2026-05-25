import { PartialType } from '@nestjs/mapped-types';
import { CreateCustomReportDto } from './create-custom-report.dto';

export class UpdateCustomReportDto extends PartialType(CreateCustomReportDto) {}
