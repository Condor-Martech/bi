import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserGroupSchema, UserGroups } from '../../modules/user-groups/user-group.entity';
import { PermissionsService } from './permissions.service';
import { ReportAccessGuard } from './report-access.guard';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: UserGroups.name, schema: UserGroupSchema }]),
    ],
    providers: [PermissionsService, ReportAccessGuard],
    exports: [PermissionsService, ReportAccessGuard],
})
export class PermissionsModule { }
