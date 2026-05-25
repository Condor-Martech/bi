import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserGroupDocument, UserGroups } from '../../modules/user-groups/user-group.entity';
import { ROLE_TYPES } from '../../modules/users/dto/create-user.dto';

/**
 * Resolutor único de permisos de reportes.
 *
 * Modelo: resolución EN VIVO. Los reportes que un usuario puede ver se calculan en
 * cada request como la unión de sus reportes directos (`User.reportsByPB`) y los del
 * grupo al que pertenece (`User.userGroups` → `UserGroups.reports`). No se denormaliza:
 * editar un grupo aplica al instante, sin sincronización ni drift.
 */
@Injectable()
export class PermissionsService {
    constructor(
        @InjectModel(UserGroups.name) private readonly userGroupModel: Model<UserGroupDocument>,
    ) { }

    /** MANAGER y ADMIN omiten el control a nivel de objeto. */
    isPrivileged(user: any): boolean {
        return user?.role === ROLE_TYPES.MANAGER || user?.role === ROLE_TYPES.ADMIN;
    }

    /** Conjunto de reportIdPB que el usuario puede ver: directos ∪ los de su grupo. */
    async getAllowedReportIds(user: any): Promise<Set<string>> {
        const direct: string[] = user?.reportsByPB ?? [];
        let groupReports: string[] = [];

        if (user?.userGroups) {
            const group = await this.userGroupModel.findById(user.userGroups).select('reports');
            groupReports = group?.reports ?? [];
        }

        return new Set<string>([...direct, ...groupReports]);
    }

    /** `true` si el rol es privilegiado o si el reporte está en el conjunto permitido. */
    async canAccessReport(user: any, reportIdPB: string): Promise<boolean> {
        if (this.isPrivileged(user)) {
            return true;
        }
        const allowed = await this.getAllowedReportIds(user);
        return allowed.has(reportIdPB);
    }
}
