import { Test, TestingModule } from '@nestjs/testing';
import { ReportsController } from './../src/app/modules/reports/reports.controller';
import { ReportsService } from './../src/app/modules/reports/reports.service';
import { Report } from './../src/app/modules/reports/report.entity';
import { CreateReportDto } from './../src/app/modules/reports/dto/create-report.dto';
import { AccountsService } from './../src/app/modules/accounts/accounts.service';
import { GroupsService } from './../src/app/modules/groups/groups.service';
import { GroupsList } from './groups.controller.spec';
import { RefreshToken } from '../src/app/core/utils/refresh.token.service';
import { Authenticator } from '../src/app/core/utils/authenticator';
import { ROLE_TYPES } from '../src/app/modules/users/dto/create-user.dto';
import { user } from './mocks/user.mock';

const input: CreateReportDto = {
  reportIdPB: "d56sa1d65sa1d65sa--ds54151a",
  reportType: "dsa1d5sa15dsa",
  name: "Relatorio Teste",
  webUrl: "www.teste.com.br/d1sads1d2as1d2sa1",
  embedUrl: "www.teste.com.br/d1sads1d2as1d2sa1",
  isOwnedByMe: true,
  datasetId: 'ds51d5sa15d',
  groupIdPB: ['dd1sa51d5sa1d25sa15'],
  accountID: 'sa1ds5a1d2sa13d',
  users: [],
  subscriptions: []
}

const ReportList: Report[] = [
  new Report({
    name: 'Admin', groupIdPB: '020d3sa50d51sa5d1sa3', webUrl: 'www.teste.com.br/d1sads1d2as1d2sa1', embedUrl: 'www.teste.com.br / d1sads1d2as1d2sa1', reportIdPB: "1"
  }),
  new Report({
    name: 'Controladoria', groupIdPB: '020d3sa50d51sa5d1sa3', webUrl: 'www.teste.com.br/d51asd5sa152515', reportIdPB: "d*-sad-sa-d-sad-t"
  }),
  new Report({
    name: 'Operaçoes', groupIdPB: '020d3sa50d51sa5d1sa3', webUrl: 'www.teste.com.br/d51asd5sa15', reportIdPB: "d56sa6d51sa25d1sa65d16a-t"
  })
];
const resultList = { reports: ReportList, count: 3 };

describe('ReportsController', () => {
  let reportsController: ReportsController;
  let reportsService: ReportsService;
  let groupsService: GroupsService;
  let authenticator: Authenticator;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [
        {
          provide: ReportsService,
          useValue: {
            reportModel: jest.fn(),
            groupModel: jest.fn(),
            findAll: jest.fn().mockResolvedValue(resultList),
            findOne: jest.fn().mockResolvedValue(ReportList[0]),
            remove: jest.fn().mockResolvedValue(undefined),
            getAllReportsByGroup: jest.fn().mockResolvedValue(undefined),
          }
        },
        {
          provide: GroupsService,
          useValue: {
            getAllGroup: jest.fn(),
            findAll: jest.fn(),
            createAllGroupByAccount: jest.fn(),
            findAllByAccount: jest.fn()
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
            findByExpiresOn: jest.fn(),
            getBiAccount: jest.fn(),
            getTokenFromDB: jest.fn(),
            getNewAccessToken: jest.fn(),
            update: jest.fn()
          }
        }]
    }).compile();

    reportsController = module.get<ReportsController>(ReportsController);
    reportsService = module.get<ReportsService>(ReportsService);
    authenticator = module.get<Authenticator>(Authenticator);
    groupsService = module.get<GroupsService>(GroupsService);
  });

  it('should be defined', () => {
    expect(reportsController).toBeDefined();
    expect(reportsService).toBeDefined();
    expect(authenticator).toBeDefined();
    expect(groupsService).toBeDefined();
  });

  describe('syncronizeByApi', () => {
    describe('syncronizeByApi', () => {
      it('should synchronize reports', async () => {
        const groups = { groups: GroupsList, countReports: GroupsList.length };
        const token = 'Bearer token';
        const req: any = { headers: { authorization: token } };
        const accountID = ['dsa1d5sa1d5s1a'];
        const groupsResult = [
          { id: '1', name: 'Group 1' },
          { id: '2', name: 'Group 2' },
        ];

        jest.spyOn(authenticator, 'checkUserAndRole').mockResolvedValue(user);

        jest.spyOn(groupsService, 'createAllGroupByAccount').mockResolvedValue(groupsResult);
        jest.spyOn(groupsService, 'findAllByAccount').mockResolvedValue(groups);
        jest.spyOn(reportsService, 'getAllReportsByGroup').mockResolvedValue();
        jest.spyOn(reportsController, 'findAll').mockResolvedValue(resultList);

        const result = await reportsController.syncronizeByApi(req);

        expect(groupsService.createAllGroupByAccount).toHaveBeenCalled();
        expect(groupsService.findAllByAccount).toHaveBeenCalled();
        expect(reportsService.getAllReportsByGroup).toHaveBeenCalled();
        expect(authenticator.checkUserAndRole).toHaveBeenCalledWith(token);
        expect(result).toEqual(resultList);
        expect.assertions(5);
      });
    });

    it('should throw an error if getAllGroup returns undefined', async () => {
      const token = 'Bearer token';
      const req: any = { headers: { authorization: token } };
      jest.spyOn(groupsService, 'findAllByAccount').mockRejectedValueOnce(undefined);

      await expect(reportsController.syncronizeByApi(req)).rejects.toThrow(Error);

    });
  });

  describe('findAll', () => {
    it('should return all reports', async () => {
      const token = 'Bearer token';
      const req: any = { headers: { authorization: token } };

      const result = await reportsController.findAll(req);

      expect(reportsService.findAll).toHaveBeenCalled();
      expect(result).toEqual(resultList);
      expect.assertions(2);
    });
    it('should handle errors', async () => {
      const token = 'Bearer token';
      const req: any = { headers: { authorization: token } };

      jest.spyOn(reportsService, 'findAll').mockRejectedValueOnce(new Error());
      await expect(reportsController.findAll(req)).rejects.toThrowError();
    });
  });

  describe('findOne', () => {
    it('should return a report by ID', async () => {
      const token = 'Bearer token';
      const tokenData: any = { id: 'managerId', email: 'teste@email.com', role: ROLE_TYPES.MANAGER };
      const req: any = { headers: { authorization: token } };
      const reportID = '1';

      jest.spyOn(authenticator, 'getTokenData').mockReturnValue(tokenData);
      jest.spyOn(reportsService, 'findOne').mockResolvedValue(ReportList[0]);

      const result = await reportsController.findOne(req, reportID);

      expect(authenticator.getTokenData).toHaveBeenCalledWith(token);
      expect(reportsService.findOne).toHaveBeenCalledWith(reportID, tokenData);
      expect(result).toEqual(ReportList[0]);
      expect.assertions(3);
    });

    it('should handle errors', async () => {
      const reportID = '1';
      const token = 'Bearer token';
      const req: any = { headers: { authorization: token } };

      jest.spyOn(reportsService, 'findOne').mockRejectedValueOnce(new Error('Some error'));

      await expect(reportsController.findOne(req, reportID)).rejects.toThrowError('Some error');
    });
  });

  describe('remove', () => {
    it('should remove a report by ID', async () => {
      const reportID = '1';
      const token = 'Bearer token';
      const req: any = { headers: { authorization: token } };

      await expect(reportsController.remove(req, reportID)).resolves.toBeUndefined();
      expect(reportsService.remove).toHaveBeenCalledTimes(1);
      expect(reportsService.remove).toHaveBeenCalledWith(reportID);
    });
    it('should handle errors', async () => {
      const reportID = '1';
      const token = 'Bearer token';
      const req: any = { headers: { authorization: token } };
      jest.spyOn(reportsService, 'remove').mockRejectedValueOnce(new Error());
      await expect(reportsController.remove(req, reportID)).rejects.toThrowError();
    });
  });
});