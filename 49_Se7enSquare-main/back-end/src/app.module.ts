import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './common/guards/roles.guard';
import { CommunitiesModule } from './modules/communities/communities.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { EventsModule } from './modules/events/events.module';
import { PostsModule } from './modules/posts/posts.module';
import { RbacModule } from './modules/rbac/rbac.module';
import { ReportsModule } from './modules/reports/reports.module';
import { UsersModule } from './modules/users/users.module';
import { MembershipsModule } from './modules/memberships/memberships.module';

@Module({
  imports: [
    RbacModule,
    UsersModule,
    CommunitiesModule,
    EventsModule,
    ReportsModule,
    PostsModule,
    DashboardModule,
    MembershipsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}

