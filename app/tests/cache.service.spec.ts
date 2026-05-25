import { CacheService } from '../src/app/core/cache/cache.service';

describe('CacheService', () => {
  let service: CacheService;
  let cacheManager: any;
  let client: any;

  beforeEach(() => {
    client = {
      scan: jest.fn(),
      unlink: jest.fn().mockResolvedValue(undefined),
    };
    cacheManager = {
      get: jest.fn(),
      set: jest.fn().mockResolvedValue(undefined),
      del: jest.fn().mockResolvedValue(undefined),
      store: { client },
    };
    service = new CacheService(cacheManager);
  });

  describe('wrap', () => {
    it('em miss: executa o producer, cacheia e devolve o valor', async () => {
      cacheManager.get.mockResolvedValue(undefined);
      const producer = jest.fn().mockResolvedValue({ data: 1 });

      const result = await service.wrap('reports:all', producer, 1000);

      expect(producer).toHaveBeenCalledTimes(1);
      expect(cacheManager.set).toHaveBeenCalledWith('reports:all', { data: 1 }, 1000);
      expect(result).toEqual({ data: 1 });
    });

    it('em hit: devolve o cacheado sem chamar o producer nem cachear de novo', async () => {
      cacheManager.get.mockResolvedValue({ data: 'cached' });
      const producer = jest.fn();

      const result = await service.wrap('reports:all', producer);

      expect(producer).not.toHaveBeenCalled();
      expect(cacheManager.set).not.toHaveBeenCalled();
      expect(result).toEqual({ data: 'cached' });
    });

    it('não cacheia quando o producer devolve undefined', async () => {
      cacheManager.get.mockResolvedValue(undefined);
      const producer = jest.fn().mockResolvedValue(undefined);

      const result = await service.wrap('filters:tables:x', producer);

      expect(result).toBeUndefined();
      expect(cacheManager.set).not.toHaveBeenCalled();
    });

    it('não cacheia quando shouldCache rejeita o valor (envelope de erro)', async () => {
      cacheManager.get.mockResolvedValue(undefined);
      const errorEnvelope = { message: 'An error occurred' };
      const producer = jest.fn().mockResolvedValue(errorEnvelope);

      const result = await service.wrap(
        'filters:datasets:all',
        producer,
        1000,
        (v: any) => v != null && !v.message,
      );

      expect(result).toEqual(errorEnvelope);
      expect(cacheManager.set).not.toHaveBeenCalled();
    });

    it('não cacheia quando o producer lança — o erro propaga', async () => {
      cacheManager.get.mockResolvedValue(undefined);
      const producer = jest.fn().mockRejectedValue(new Error('Mongo caiu'));

      await expect(service.wrap('reports:all', producer)).rejects.toThrow('Mongo caiu');
      expect(cacheManager.set).not.toHaveBeenCalled();
    });

    it('degrada com o Redis caído: chama o producer mesmo se o GET falha', async () => {
      cacheManager.get.mockRejectedValue(new Error('Redis indisponível'));
      const producer = jest.fn().mockResolvedValue({ data: 2 });

      const result = await service.wrap('reports:all', producer);

      expect(producer).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ data: 2 });
    });
  });

  describe('delByPrefix', () => {
    it('escaneia pelo prefixo e faz unlink das chaves encontradas', async () => {
      client.scan.mockResolvedValue({ cursor: 0, keys: ['reports:all', 'reports:other'] });

      await service.delByPrefix('reports:');

      expect(client.scan).toHaveBeenCalledWith(0, { MATCH: 'reports:*', COUNT: 100 });
      expect(client.unlink).toHaveBeenCalledWith(['reports:all', 'reports:other']);
    });

    it('percorre todas as páginas do cursor SCAN antes do unlink', async () => {
      client.scan
        .mockResolvedValueOnce({ cursor: 42, keys: ['reports:a'] })
        .mockResolvedValueOnce({ cursor: 0, keys: ['reports:b'] });

      await service.delByPrefix('reports:');

      expect(client.scan).toHaveBeenCalledTimes(2);
      expect(client.unlink).toHaveBeenCalledWith(['reports:a', 'reports:b']);
    });

    it('não faz unlink quando não há chaves no namespace', async () => {
      client.scan.mockResolvedValue({ cursor: 0, keys: [] });

      await service.delByPrefix('groups:');

      expect(client.unlink).not.toHaveBeenCalled();
    });

    it('não lança quando o cliente Redis está indisponível', async () => {
      const noClient = new CacheService({ store: {} } as any);
      await expect(noClient.delByPrefix('reports:')).resolves.toBeUndefined();
    });
  });

  describe('robustez', () => {
    it('get devolve undefined se o cache lança', async () => {
      cacheManager.get.mockRejectedValue(new Error('boom'));
      await expect(service.get('k')).resolves.toBeUndefined();
    });

    it('set não propaga erros do cache', async () => {
      cacheManager.set.mockRejectedValue(new Error('boom'));
      await expect(service.set('k', 'v')).resolves.toBeUndefined();
    });

    it('del aceita uma lista de chaves', async () => {
      await service.del(['a', 'b']);
      expect(cacheManager.del).toHaveBeenCalledWith('a');
      expect(cacheManager.del).toHaveBeenCalledWith('b');
    });
  });
});
