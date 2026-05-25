import { GroupsService } from '../src/app/modules/groups/groups.service';
import { CACHE_NS, CACHE_TTL, CacheKeys } from '../src/app/core/cache/cache.keys';

describe('GroupsService — cache', () => {
  let service: GroupsService;
  let cache: any;
  let groupModel: any;
  let reportModel: any;
  let accountService: any;
  let http: any;

  beforeEach(() => {
    cache = {
      wrap: jest.fn(),
      delByPrefix: jest.fn().mockResolvedValue(undefined),
    };
    groupModel = {
      find: jest.fn(),
      deleteOne: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue({ deletedCount: 1 }) }),
      deleteMany: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue({ deletedCount: 3 }) }),
    };
    reportModel = {
      deleteMany: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue({ deletedCount: 5 }) }),
      countDocuments: jest.fn(),
    };
    accountService = { getIdAccount: jest.fn() };
    http = { get: jest.fn() };
    service = new GroupsService(cache, groupModel, reportModel, accountService, http);
  });

  describe('findOneAndReports', () => {
    it('lê via cache.wrap usando a chave do namespace groups e TTL de 1h', async () => {
      cache.wrap.mockResolvedValue({ data: [], count: 0 });

      const result = await service.findOneAndReports('grp-123');

      expect(cache.wrap).toHaveBeenCalledWith(
        CacheKeys.groupReports('grp-123'),
        expect.any(Function),
        CACHE_TTL.ONE_HOUR,
      );
      expect(result).toEqual({ data: [], count: 0 });
    });
  });

  describe('createAllGroupByAccount', () => {
    it('invalida os namespaces groups e reports após o rebuild destrutivo', async () => {
      // O fluxo aborta logo após os deletes (getIdAccount falha) — o que
      // importa aqui é que a invalidação já aconteceu antes do rebuild.
      accountService.getIdAccount.mockRejectedValue({ response: { data: 'stop' } });

      await service.createAllGroupByAccount('acc-1');

      expect(cache.delByPrefix).toHaveBeenCalledWith(CACHE_NS.GROUPS);
      expect(cache.delByPrefix).toHaveBeenCalledWith(CACHE_NS.REPORTS);
    });
  });

  describe('remove / removeAll', () => {
    it('remove invalida o namespace groups', async () => {
      await service.remove('grp-123');
      expect(cache.delByPrefix).toHaveBeenCalledWith(CACHE_NS.GROUPS);
    });

    it('removeAll invalida o namespace groups', async () => {
      await service.removeAll('acc-1');
      expect(cache.delByPrefix).toHaveBeenCalledWith(CACHE_NS.GROUPS);
    });
  });
});
