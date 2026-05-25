import { Global, Module } from '@nestjs/common';
import { CacheService } from './cache.service';

/**
 * Disponibiliza o CacheService em toda a aplicação. O provider CACHE_MANAGER
 * já é global (CacheModule.registerAsync com isGlobal:true em app.config.ts),
 * portanto este módulo só precisa exportar o CacheService.
 */
@Global()
@Module({
  providers: [CacheService],
  exports: [CacheService],
})
export class CoreCacheModule {}
