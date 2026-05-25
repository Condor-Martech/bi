import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import { SentryInterceptor } from './app/core/sentry/sentry.interceptor';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('app')
@UseInterceptors(SentryInterceptor)
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
