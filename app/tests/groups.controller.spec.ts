import { GroupsController } from './../src/app/modules/groups/groups.controller';
import { AccountsService } from '../src/app/modules/accounts/accounts.service';
import { ReportsService } from './../src/app/modules/reports/reports.service';
import { RefreshToken } from '../src/app/core/utils/refresh.token.service';
import { GroupsService } from './../src/app/modules/groups/groups.service';
import { Authenticator } from '../src/app/core/utils/authenticator';
import { Group } from './../src/app/modules/groups/group.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { groupWithReport } from './mocks/group.mock';
import { user } from './mocks/user.mock';

export const GroupsList: Group[] = [
  new Group({
    name: 'Admin', groupIdPB: '020d3sa50d51sa5d1sa3', isReadOnly: true, isOnDedicatedCapacity: false, type: "teste-t"
  }),
  new Group({
    name: 'Controladoria', groupIdPB: '020d3sa50d51sa5d1sa3', isReadOnly: true, isOnDedicatedCapacity: false, type: "teste-t"
  }),
  new Group({
    name: 'Operaçoes', groupIdPB: '020d3sa50d51sa5d1sa3', isReadOnly: true, isOnDedicatedCapacity: false, type: "teste-t"
  })
]

describe('GroupsController', () => {
  let groupsController: GroupsController;
  let groupsService: GroupsService;
  let authenticator: Authenticator;
  let accountService: AccountsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupsController],
      providers: [
        {
          provide: GroupsService,
          useValue: {
            groupModel: jest.fn(),
            reportModel: jest.fn(),
            getAllGroup: jest.fn().mockResolvedValue(GroupsList),
            createMany: jest.fn(),
            createAllGroupByAccount: jest.fn(),
            findAllByAccount: jest.fn(),
            findAll: jest.fn().mockResolvedValue(GroupsList),
            findOneAndReports: jest.fn().mockResolvedValue(groupWithReport),
            findOne: jest.fn().mockResolvedValue(GroupsList[1]),
            remove: jest.fn().mockResolvedValue(undefined),
            removeAll: jest.fn(),
          },
        },
        {
          provide: Authenticator,
          useValue: {
            generate: jest.fn(),
            getTokenData: jest.fn(),
            checkUserAndRole: jest.fn()
          }
        },
        {
          provide: AccountsService,
          useValue: {
            create: jest.fn(),
            findAllAccounts: jest.fn(),
            findByExpiresOn: jest.fn(),
            getBiAccount: jest.fn(),
            getIdAccount: jest.fn().mockResolvedValue({ _id: '64f737c1af79c52157949233' }),
            getNewAccessToken: jest.fn(),
            update: jest.fn()
          }
        },
        {
          provide: ReportsService,
          useValue: {
            getAllReportsByGroup: jest.fn(),
            getReports: jest.fn(),
            createMany: jest.fn(),
            findAll: jest.fn(),
            addGroupId: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
            removeAll: jest.fn(),
          },
        },
        {
          provide: RefreshToken,
          useValue: {
            refresh: jest.fn()
          }
        }]
    }).compile();

    groupsController = module.get<GroupsController>(GroupsController);
    groupsService = module.get<GroupsService>(GroupsService);
    authenticator = module.get<Authenticator>(Authenticator);
    accountService = module.get<AccountsService>(AccountsService);
  });

  it('should be defined', () => {
    expect(groupsController).toBeDefined();
    expect(groupsService).toBeDefined();
    expect(authenticator).toBeDefined();
    expect(accountService).toBeDefined();
  });

  describe('createByApi', () => {
    it('should create groups for the account', async () => {

      const token = 'Bearer token';
      const expected = "64f737c1af79c52157949233"

      jest.spyOn(authenticator, 'checkUserAndRole').mockResolvedValue(user);
      jest.spyOn(groupsService, 'createAllGroupByAccount').mockResolvedValue(GroupsList);

      const req: any = { headers: { authorization: token } };

      const result = await groupsController.createByApi(req);


      expect(result).toBe(GroupsList);
      expect(authenticator.checkUserAndRole).toHaveBeenCalledWith(token);
      expect(accountService.getIdAccount).toHaveBeenCalledWith(user.accountID[0]);
      expect(groupsService.createAllGroupByAccount).toHaveBeenCalledWith(user.accountID[0]);

    });
  });
  describe('findAll', () => {
    it('should return all groups', async () => {
      const token = 'Bearer token';
      const account = 'account-id';
      const req: any = { headers: { authorization: token } };


      jest.spyOn(groupsService, 'findAllByAccount').mockResolvedValue({ groups: GroupsList, countReports: GroupsList.length });
      const result = await groupsController.findAll(account, req);
      expect(groupsService.findAllByAccount).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ groups: GroupsList, countReports: GroupsList.length });
      expect.assertions(2);
    });

    it('should handle errors', async () => {
      const token = 'Bearer token';
      const account = { _id: 'account-id' };
      const req: any = { headers: { authorization: token } };
      jest.spyOn(groupsService, 'findAllByAccount').mockRejectedValueOnce(new Error());
      await expect(groupsController.findAll(account._id, req)).rejects.toThrowError();
    });
  });

  describe('getReportsByGroup', () => {
    it('should get reports by group', async () => {

      const token = 'Bearer token';
      const groupIdPB = 'group-id';
      const userID = '1';
      const reports = [/* relatórios retornados esperados */];
      const count = reports.length;

      jest.spyOn(authenticator, 'getTokenData').mockResolvedValue(token as never);
      jest.spyOn(groupsService, 'findOneAndReports').mockResolvedValue({ data: reports, count });

      const req: any = { headers: { authorization: token } };

      const result = await groupsController.getReportsByGroup(req, groupIdPB);

      expect(result).toEqual({ data: reports, count });
      expect(authenticator.getTokenData).toHaveBeenCalledWith(token);
      expect(groupsService.findOneAndReports).toHaveBeenCalledWith(groupIdPB);
    });
    it('should handle errors', async () => {
      const groupID = '1';
      const token = 'Bearer token';
      const req: any = { headers: { authorization: token } };
      jest.spyOn(groupsService, 'findOneAndReports').mockRejectedValueOnce(new Error());
      await expect(groupsController.getReportsByGroup(req, groupID)).rejects.toThrowError();
    });
  });

  describe('findOne', () => {
    it('should return a group by ID', async () => {
      const token = 'Bearer token';
      const req: any = { headers: { authorization: token } };
      const groupID = '1';
      jest.spyOn(groupsService, 'findOne').mockResolvedValue(GroupsList[1]);
      const result = await groupsController.findOne(req, groupID);

      expect(groupsService.findOne).toHaveBeenCalledWith(groupID);
      expect(result).toEqual(GroupsList[1]);
      expect.assertions(2);
    });

    it('should handle errors', async () => {
      const token = 'Bearer token';
      const req: any = { headers: { authorization: token } };
      const groupID = '1';
      jest.spyOn(groupsService, 'findOne').mockRejectedValueOnce(new Error());
      await expect(groupsController.findOne(req, groupID)).rejects.toThrowError();
    });
  });

  describe('remove', () => {
    it('should remove a group by ID', async () => {
      const token = 'Bearer token';
      const req: any = { headers: { authorization: token } };
      const groupID = '1';
      await expect(groupsController.remove(req, groupID)).resolves.toBeUndefined();
      expect(groupsService.remove).toHaveBeenCalledTimes(1);
      expect(groupsService.remove).toHaveBeenCalledWith(groupID);
    });

    it('should handle errors', async () => {
      const token = 'Bearer token';
      const req: any = { headers: { authorization: token } };
      const groupID = '1';
      jest.spyOn(groupsService, 'remove').mockRejectedValueOnce(new Error());
      await expect(groupsController.remove(req, groupID)).rejects.toThrowError();
    });
  });
});
