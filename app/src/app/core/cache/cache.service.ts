import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';

type Producer<T> = () => Promise<T>;
type ShouldCache<T> = (value: T) => boolean;

/** Por defeito não cacheia valores vazios (undefined/null). */
const defaultShouldCache: ShouldCache<unknown> = (value) =>
  value !== undefined && value !== null;

/**
 * Camada fina sobre o cache-manager. Centraliza o acesso ao Redis:
 * leitura get-or-set (`wrap`) e invalidação por namespace (`delByPrefix`).
 *
 * Política de robustez: se o Redis estiver indisponível, toda operação
 * degrada de forma silenciosa — `wrap` chama o produtor direto e a app
 * continua servindo dados do Mongo / Power BI sem cache.
 */
@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  async get<T>(key: string): Promise<T | undefined> {
    try {
      return (await this.cacheManager.get<T>(key)) ?? undefined;
    } catch (error) {
      this.logger.warn(`Cache GET falhou (${key}): ${error?.message ?? error}`);
      return undefined;
    }
  }

  async set<T>(key: string, value: T, ttlMs?: number): Promise<void> {
    try {
      await this.cacheManager.set(key, value, ttlMs);
    } catch (error) {
      this.logger.warn(`Cache SET falhou (${key}): ${error?.message ?? error}`);
    }
  }

  async del(keys: string | string[]): Promise<void> {
    const list = Array.isArray(keys) ? keys : [keys];
    await Promise.all(
      list.map(async (key) => {
        try {
          await this.cacheManager.del(key);
        } catch (error) {
          this.logger.warn(`Cache DEL falhou (${key}): ${error?.message ?? error}`);
        }
      }),
    );
  }

  /**
   * Get-or-set. Devolve o valor cacheado; em miss executa `producer`,
   * cacheia o resultado e o devolve.
   *
   * Nunca cacheia falhas: se `producer` lança, o erro propaga sem cachear;
   * se devolve um valor rejeitado por `shouldCache` (por defeito undefined/null),
   * o resultado é devolvido mas não vai ao cache.
   */
  async wrap<T>(
    key: string,
    producer: Producer<T>,
    ttlMs?: number,
    shouldCache: ShouldCache<T> = defaultShouldCache,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== undefined) {
      return cached;
    }
    const value = await producer();
    if (shouldCache(value)) {
      await this.set(key, value, ttlMs);
    }
    return value;
  }

  /**
   * Invalida todas as chaves de um namespace via SCAN + UNLINK no cliente
   * Redis cru. Chamar após qualquer operação transacional no Mongo que
   * torne o namespace obsoleto.
   *
   * Usa um loop de cursor SCAN (não bloqueante) — não `scanIterator` —
   * para não depender de async iteration (o target do projeto é ES2017).
   */
  async delByPrefix(prefix: string): Promise<void> {
    try {
      const client = this.getRedisClient();
      if (!client) {
        this.logger.warn(`delByPrefix (${prefix}): cliente Redis indisponível`);
        return;
      }
      const keys: string[] = [];
      let cursor = 0;
      do {
        const reply = await client.scan(cursor, { MATCH: `${prefix}*`, COUNT: 100 });
        cursor = Number(reply.cursor);
        if (reply.keys && reply.keys.length > 0) {
          keys.push(...reply.keys);
        }
      } while (cursor !== 0);
      if (keys.length > 0) {
        await client.unlink(keys);
        this.logger.log(`Cache invalidado: ${keys.length} chave(s) sob "${prefix}"`);
      }
    } catch (error) {
      this.logger.warn(`delByPrefix falhou (${prefix}): ${error?.message ?? error}`);
    }
  }

  /** Cliente node-redis cru exposto pelo store cache-manager-redis-yet. */
  private getRedisClient(): any {
    const store: any = (this.cacheManager as any).store;
    return store?.client;
  }
}
