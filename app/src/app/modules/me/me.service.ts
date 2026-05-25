import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { PermissionsService } from '../../core/permissions/permissions.service';
import { Account, AccountDocument } from '../accounts/account.entity';
import { Group, GroupsDocument } from '../groups/group.entity';
import { Report, ReportDocument } from '../reports/report.entity';
import { ROLE_TYPES } from '../users/dto/create-user.dto';
import { UserDocument } from '../users/user.entity';

export interface SidebarWorkspace {
  id: string;
  pbWorkspaceId: string;
  name: string;
}

export interface SidebarAccount {
  id: string;
  name: string;
  workspaces: SidebarWorkspace[];
}

export interface MeReport {
  id: string;
  workspaceId: string;
  pbReportId: string;
  name: string;
  embedUrl: string;
  webUrl: string;
  lastSyncedAt: string | null;
}

@Injectable()
export class MeService {
  constructor(
    @InjectModel(Account.name) private readonly accountModel: Model<AccountDocument>,
    @InjectModel(Group.name) private readonly groupModel: Model<GroupsDocument>,
    @InjectModel(Report.name) private readonly reportModel: Model<ReportDocument>,
    private readonly permissions: PermissionsService,
  ) {}

  /**
   * Returns the sidebar tree (accounts + workspaces) for the authenticated user.
   *
   * - MANAGER / ADMIN: every account and every workspace.
   * - USER: only accounts referenced in `user.accountID`, with all of their
   *   workspaces. Per-report RBAC is enforced downstream in the workspace page,
   *   not here.
   *
   * Implemented at the model layer (not via AccountsService / GroupsService) to
   * avoid Azure refresh-token side effects on a read-only navigation call.
   */
  async getSidebar(user: UserDocument): Promise<SidebarAccount[]> {
    const privileged = user.role === ROLE_TYPES.MANAGER || user.role === ROLE_TYPES.ADMIN;

    const accountFilter = privileged
      ? {}
      : { _id: { $in: (user.accountID ?? []).map((id) => new Types.ObjectId(id)) } };

    const accounts = await this.accountModel
      .find(accountFilter)
      .select('_id nameAccount email')
      .lean()
      .exec();

    if (accounts.length === 0) return [];

    const accountIds = accounts.map((a) => String(a._id));
    const groups = await this.groupModel
      .find({ accountId: { $in: accountIds } })
      .select('_id groupIdPB accountId name')
      .lean()
      .exec();

    const groupsByAccount = new Map<string, SidebarWorkspace[]>();
    for (const g of groups) {
      const key = String(g.accountId);
      const list = groupsByAccount.get(key) ?? [];
      list.push({
        id: String(g._id),
        pbWorkspaceId: g.groupIdPB,
        name: g.name,
      });
      groupsByAccount.set(key, list);
    }

    return accounts.map((a) => ({
      id: String(a._id),
      name: a.nameAccount || a.email,
      workspaces: (groupsByAccount.get(String(a._id)) ?? []).sort((x, y) =>
        x.name.localeCompare(y.name),
      ),
    }));
  }

  /**
   * Lista los reports accesibles al usuario dentro de un workspace de Power BI.
   *
   * - MANAGER / ADMIN: todos los reports cuyo `groupIdPB === pbWorkspaceId`.
   * - USER: la intersección de los reports permitidos (directos ∪ grupo) con los
   *   del workspace pedido. Resolución en vivo via PermissionsService.
   */
  async getReports(user: UserDocument, pbWorkspaceId: string): Promise<MeReport[]> {
    const baseFilter: Record<string, unknown> = { groupIdPB: pbWorkspaceId };

    if (!this.permissions.isPrivileged(user)) {
      const allowed = [...(await this.permissions.getAllowedReportIds(user))];
      if (allowed.length === 0) return [];
      baseFilter.reportIdPB = { $in: allowed };
    }

    const reports = await this.reportModel
      .find(baseFilter)
      .select('_id reportIdPB groupIdPB name embedUrl webUrl updatedAt')
      .lean()
      .exec();

    return reports
      .map((r) => ({
        id: String(r._id),
        workspaceId: r.groupIdPB ?? pbWorkspaceId,
        pbReportId: r.reportIdPB,
        name: r.name,
        embedUrl: r.embedUrl,
        webUrl: r.webUrl,
        lastSyncedAt:
          (r as { updatedAt?: Date }).updatedAt?.toISOString() ?? null,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }
}
