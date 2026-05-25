import {
  BadGatewayException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, map } from 'rxjs';
import { ANALYSIS_LIMITS } from '../analysis.constants';

export type ExecuteQueryResult = {
  rows: any[];
  rowCount: number;
};

export type SchemaDigest = {
  /** Texto compacto pronto para incluir no prompt do LLM. */
  digest: string;
  /** true se todas as seções (TABLES/COLUMNS/MEASURES) foram descobertas. */
  complete: boolean;
};

/**
 * Camada fina de acesso à API executeQueries do Power BI.
 * Responsabilidades:
 *   - executar uma query DAX e devolver linhas;
 *   - descobrir o schema do dataset via DAX INFO.VIEW.* (fallback INFO.*);
 *   - traduzir erros HTTP da API em HttpExceptions legíveis (401/403/429).
 */
@Injectable()
export class PowerBiQueryService {
  private readonly logger = new Logger(PowerBiQueryService.name);

  constructor(private readonly http: HttpService) {}

  private endpoint(groupId: string, datasetId: string): string {
    const base = process.env.POWER_BI_BASE_URL;
    return `${base}/groups/${groupId}/datasets/${datasetId}/executeQueries`;
  }

  async executeQuery(token: string, groupId: string, datasetId: string, dax: string): Promise<ExecuteQueryResult> {
    const url = this.endpoint(groupId, datasetId);
    const body = {
      queries: [{ query: dax }],
      serializerSettings: { includeNulls: true },
    };
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      timeout: ANALYSIS_LIMITS.DAX_QUERY_TIMEOUT_MS,
    };
    try {
      const data: any = await firstValueFrom(this.http.post(url, body, config).pipe(map((r) => r.data)));
      // executeQueries pode devolver erro estruturado mesmo com HTTP 200.
      const apiError = data?.results?.[0]?.error;
      if (apiError) {
        throw new BadGatewayException(`DAX error: ${apiError.message ?? JSON.stringify(apiError)}`);
      }
      const rows: any[] = data?.results?.[0]?.tables?.[0]?.rows ?? [];
      return { rows, rowCount: rows.length };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw this.translateError(error);
    }
  }

  /**
   * Descobre o schema do dataset via DAX INFO.VIEW.* (fallback INFO.*).
   * 403/401 ao primeiro contato são fatais (propagados); demais erros degradam
   * — uma seção que falha vira "indisponível" e a descoberta segue.
   */
  async discoverSchema(token: string, groupId: string, datasetId: string): Promise<SchemaDigest> {
    const sections: Array<{ label: string; primary: string; fallback: string }> = [
      { label: 'TABLES', primary: 'EVALUATE INFO.VIEW.TABLES()', fallback: 'EVALUATE INFO.TABLES()' },
      { label: 'COLUMNS', primary: 'EVALUATE INFO.VIEW.COLUMNS()', fallback: 'EVALUATE INFO.COLUMNS()' },
      { label: 'MEASURES', primary: 'EVALUATE INFO.VIEW.MEASURES()', fallback: 'EVALUATE INFO.MEASURES()' },
    ];

    const parts: string[] = [];
    let successes = 0;

    for (const s of sections) {
      let rows = await this.tryQuery(token, groupId, datasetId, s.primary);
      if (rows === null) {
        rows = await this.tryQuery(token, groupId, datasetId, s.fallback);
      }
      if (rows === null) continue;
      successes++;
      parts.push(`### ${s.label}\n${this.compactRows(rows)}`);
    }

    return {
      digest: parts.join('\n\n'),
      complete: successes === sections.length,
    };
  }

  /**
   * Executa uma query auxiliar. Em erro DAX retorna null (caller tenta fallback).
   * Em 401/403 propaga: sem acesso, não dá para seguir analisando.
   */
  private async tryQuery(token: string, groupId: string, datasetId: string, dax: string): Promise<any[] | null> {
    try {
      const { rows } = await this.executeQuery(token, groupId, datasetId, dax);
      return rows;
    } catch (error) {
      if (error instanceof ForbiddenException || error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.warn(`Schema query falhou (${dax.slice(0, 40)}...): ${(error as any)?.message ?? error}`);
      return null;
    }
  }

  /** Compactação simples para o prompt do LLM. Trunca em 200 linhas / 12kb. */
  private compactRows(rows: any[]): string {
    if (!rows || rows.length === 0) return '(sem linhas)';
    const sliced = rows.slice(0, 200);
    const raw = JSON.stringify(sliced);
    return raw.length > 12000 ? raw.slice(0, 12000) + '... [truncado]' : raw;
  }

  private translateError(error: any): HttpException {
    const status = error?.response?.status;
    const data = error?.response?.data;
    const detail = data?.error?.message ?? data?.message ?? error?.message ?? 'erro desconhecido';

    if (status === 401) {
      return new UnauthorizedException(`Power BI 401: ${detail}`);
    }
    if (status === 403) {
      const lower = String(detail).toLowerCase();
      // 403 com "expired" — problema de TOKEN, não de permissão.
      if (lower.includes('expired') || lower.includes('expirou')) {
        return new ForbiddenException(
          `Power BI 403: ${detail}. ` +
            'O token da conta BI foi rejeitado por expirado, mesmo após o refresh forçado. ' +
            'Possivelmente o refresh_token também está invalidado — recadastre a conta via POST /accounts/create.',
        );
      }
      // 403 sem "expired" — problema de PERMISSÃO/tenant.
      return new ForbiddenException(
        `Power BI 403: ${detail}. ` +
          'Verifique se o setting de tenant "Dataset Execute Queries REST API" está habilitado ' +
          'e se a conta de serviço tem permissão Build no dataset.',
      );
    }
    if (status === 429) {
      const retryAfter = error?.response?.headers?.['retry-after'];
      return new HttpException(
        `Power BI 429: ${detail}${retryAfter ? ` (Retry-After: ${retryAfter})` : ''}`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    if (status && status >= 400 && status < 500) {
      return new BadGatewayException(`Power BI ${status}: ${detail}`);
    }
    return new BadGatewayException(`Power BI: ${detail}`);
  }
}
