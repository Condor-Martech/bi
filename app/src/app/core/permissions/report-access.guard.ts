import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { PermissionsService } from './permissions.service';

/**
 * Autorización a nivel de objeto para reportes individuales.
 *
 * Corre DESPUÉS de JwtAuthGuard (que ya pobló `request.user`). Toma el `reportId`
 * de la ruta y deniega con 403 si el usuario no tiene acceso a ese reporte.
 */
@Injectable()
export class ReportAccessGuard implements CanActivate {
    constructor(private readonly permissions: PermissionsService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const reportId: string = request.params?.reportId;

        const allowed = await this.permissions.canAccessReport(request.user, reportId);
        if (!allowed) {
            throw new ForbiddenException('Sem permissão de acesso a este relatório.');
        }
        return true;
    }
}
