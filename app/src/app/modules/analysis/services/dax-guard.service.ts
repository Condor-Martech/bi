import { Injectable } from '@nestjs/common';
import { ANALYSIS_LIMITS } from '../analysis.constants';

export type DaxGuardResult = { ok: boolean; reason?: string };

/**
 * Valida uma query DAX gerada pelo LLM antes de mandá-la ao Power BI.
 * Defesa em profundidade: DAX já é read-only por design (não tem DML),
 * mas a gente bloqueia entradas óbvias inválidas e limita o tamanho.
 */
@Injectable()
export class DaxGuard {
  validate(query: unknown): DaxGuardResult {
    if (typeof query !== 'string' || !query.trim()) {
      return { ok: false, reason: 'query vazia ou não é string' };
    }
    const trimmed = query.trim();
    if (trimmed.length > ANALYSIS_LIMITS.DAX_QUERY_MAX_CHARS) {
      return { ok: false, reason: `query excede ${ANALYSIS_LIMITS.DAX_QUERY_MAX_CHARS} caracteres` };
    }
    const upper = trimmed.toUpperCase();
    if (!upper.startsWith('EVALUATE') && !upper.startsWith('DEFINE')) {
      return { ok: false, reason: 'a query deve começar com EVALUATE ou DEFINE (DAX read-only)' };
    }
    return { ok: true };
  }
}
