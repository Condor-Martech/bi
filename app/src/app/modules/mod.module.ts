import { Module } from '@nestjs/common';
import { GroupModule } from "./groups/groups.module";
import { ReportsModule } from "./reports/reports.module";
import { UserGroupsModule } from "./user-groups/user-groups.module";
import { UsersModule } from "./users/users.module";
import { AccountsModule } from './accounts/accounts.module';
import { CustomReportsModule } from './custom-reports/custom-reports.module';
import { FavouritesModule } from './favourites/favourites.module';
import { LoginLogModule } from './login-log/login-log.module';
import { NotificationsModule } from './notifications/notifications.module';
import { FiltersModule } from './filters/filters.module';
import { MapsModule } from './maps/maps.module';
import { AnalysisModule } from './analysis/analysis.module';
import { EventsModule } from './events/events.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { MeModule } from './me/me.module';


@Module({
  imports: [
    EventsModule,
    AuditLogModule,
    MapsModule,
    UsersModule,
    GroupModule,
    FiltersModule,
    ReportsModule,
    AccountsModule,
    LoginLogModule,
    UserGroupsModule,
    FavouritesModule,
    NotificationsModule,
    CustomReportsModule,
    AnalysisModule,
    MeModule,
  ]
})

export class ModModule {}
