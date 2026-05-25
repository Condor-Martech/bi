/**
 * Constantes, prompts e schema de tool do módulo de análise com IA.
 * Mantidos em um único lugar para facilitar tuning sem tocar a lógica.
 */

export const ANALYSIS_LIMITS = {
  /** Teto de rodadas do loop agéntico (tool-calls). */
  MAX_TOOL_ITERATIONS: 4,
  /** Linhas devolvidas ao modelo por query DAX (no loop). */
  MAX_ROWS_TO_MODEL: 200,
  /** Linhas persistidas em daxRuns para trazabilidade. */
  MAX_ROWS_TO_PERSIST: 50,
  /** Timeout por executeQueries. */
  DAX_QUERY_TIMEOUT_MS: 30_000,
  /** Timeout global do cliente OpenAI. */
  OPENAI_TIMEOUT_MS: 90_000,
  /** Tamanho máximo aceito de uma query DAX gerada. */
  DAX_QUERY_MAX_CHARS: 4000,
};

export const DEFAULT_OPENAI_MODEL = 'gpt-4o-mini';

/**
 * Estimativa de custo USD por 1M tokens. Aproximada — útil para tracking,
 * não é uma fatura. Modelo fora da tabela → custo 0.
 */
export const OPENAI_PRICING_USD_PER_1M: Record<string, { input: number; output: number }> = {
  'gpt-4o-mini': { input: 0.15, output: 0.6 },
  'gpt-4o': { input: 2.5, output: 10 },
  'gpt-4.1-mini': { input: 0.4, output: 1.6 },
  'gpt-4.1': { input: 2, output: 8 },
};

export function estimateCostUsd(model: string, promptTokens: number, completionTokens: number): number {
  const p = OPENAI_PRICING_USD_PER_1M[model];
  if (!p) return 0;
  return (promptTokens * p.input + completionTokens * p.output) / 1_000_000;
}

/**
 * Chaves de cache locais ao módulo. Formato `analysis:<scope>:<id>` —
 * mesma convenção do cache.keys.ts compartilhado, declarado aqui para
 * manter o módulo aditivo (sem editar arquivos compartilhados).
 */
export const ANALYSIS_CACHE = {
  latestReport: (reportIdPB: string): string => `analysis:report:${reportIdPB}`,
};

/** Schema da única tool exposta ao OpenAI no loop agéntico. */
export const RUN_DAX_TOOL: any = {
  type: 'function',
  function: {
    name: 'run_dax_query',
    description:
      'Executa uma query DAX read-only contra o dataset Power BI do relatório em análise e retorna as linhas resultantes. ' +
      'A query DEVE começar com EVALUATE ou DEFINE e DEVE limitar resultados (TOPN(1000, ...) ou agregações via SUMMARIZECOLUMNS/SUMMARIZE/GROUPBY) — ' +
      `o backend trunca em ${ANALYSIS_LIMITS.MAX_ROWS_TO_MODEL} linhas no retorno ao modelo. ` +
      'Use para coletar dados reais que sustentem o análise narrativo. Priorize agregações sobre EVALUATE de tabelas inteiras.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'A query DAX a executar. Deve começar com EVALUATE ou DEFINE.',
        },
        purpose: {
          type: 'string',
          description: 'Frase curta explicando o insight pretendido.',
        },
      },
      required: ['query', 'purpose'],
      additionalProperties: false,
    },
  },
};

export function buildSystemPrompt(language: string, focus?: string): string {
  const lang = language === 'en-US' ? 'English (en-US)' : 'Brazilian Portuguese (pt-BR)';
  const lines = [
    'You are a senior data analyst inspecting a Microsoft Power BI report.',
    'You have one tool: `run_dax_query` — use it to fetch real numbers from the dataset.',
    'Goal: surface the most relevant insights about the data — totals, trends, top categories, anomalies, comparisons over time — grounded in REAL values returned by your queries.',
    'Strategy: (1) inspect the schema given to you; (2) request 2-4 focused DAX queries that aggregate (SUMMARIZECOLUMNS, SUMMARIZE) or rank (TOPN) — avoid dumping raw tables; (3) when you have enough evidence, stop calling tools and produce the analysis.',
    `Hard limit: at most ${ANALYSIS_LIMITS.MAX_TOOL_ITERATIONS} tool-calling rounds.`,
  ];
  if (focus) lines.push(`User focus for this analysis: ${focus}`);
  lines.push(`Write the final analysis in ${lang}. Be specific, cite numbers, avoid generalities.`);
  return lines.join('\n');
}

export function buildFinalUserPrompt(language: string): string {
  if (language === 'en-US') {
    return (
      'Based on everything you have gathered, produce the final analysis as a JSON object with EXACTLY these keys: ' +
      '"summary" (string, 2-4 sentence executive summary), ' +
      '"keyFindings" (array of strings, 3-6 specific findings citing numbers), ' +
      '"anomalies" (array of strings, 0-4 anomalies/red flags or empty if none), ' +
      '"recommendations" (array of strings, 2-4 actionable suggestions). ' +
      'Write all values in English. Respond ONLY with the JSON object.'
    );
  }
  return (
    'Com base em tudo que você coletou, produza o análise final como um objeto JSON com EXATAMENTE estas chaves: ' +
    '"summary" (string, resumo executivo de 2-4 frases), ' +
    '"keyFindings" (array de strings, 3-6 achados específicos citando números), ' +
    '"anomalies" (array de strings, 0-4 anomalias/alertas ou vazio se não houver), ' +
    '"recommendations" (array de strings, 2-4 sugestões acionáveis). ' +
    'Escreva todos os valores em português do Brasil. Responda APENAS com o objeto JSON.'
  );
}
