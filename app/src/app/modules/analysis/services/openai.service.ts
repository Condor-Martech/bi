import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { ANALYSIS_LIMITS, DEFAULT_OPENAI_MODEL } from '../analysis.constants';

export type ChatUsage = {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
};

export type ChatResult = {
  /** Mensagem assistant retornada pela API (content + possíveis tool_calls). */
  message: any;
  usage: ChatUsage;
};

/**
 * Wrapper fino sobre o SDK `openai`. Concentra a leitura de env, o
 * lazy-init do client e a normalização do `usage` para nomes em camelCase.
 *
 * Se OPENAI_API_KEY não estiver definida, getClient() lança 503 — assim
 * o resto da app continua de pé mesmo sem a key configurada (este módulo
 * é aditivo: instalá-lo não pode quebrar o boot global).
 */
@Injectable()
export class OpenAiService {
  private readonly logger = new Logger(OpenAiService.name);
  private client: OpenAI | null = null;

  constructor(private readonly config: ConfigService) {}

  isConfigured(): boolean {
    return Boolean(this.config.get<string>('OPENAI_API_KEY'));
  }

  get model(): string {
    return this.config.get<string>('OPENAI_MODEL') || DEFAULT_OPENAI_MODEL;
  }

  private getClient(): OpenAI {
    if (!this.isConfigured()) {
      throw new ServiceUnavailableException(
        'OPENAI_API_KEY não configurada — o módulo de análise está desabilitado. ' +
          'Defina OPENAI_API_KEY no .env para habilitar os endpoints /analysis/*.',
      );
    }
    if (!this.client) {
      this.client = new OpenAI({
        apiKey: this.config.get<string>('OPENAI_API_KEY'),
        timeout: ANALYSIS_LIMITS.OPENAI_TIMEOUT_MS,
      });
    }
    return this.client;
  }

  async chat(messages: any[], opts: { tools?: any[]; responseFormat?: any } = {}): Promise<ChatResult> {
    const client = this.getClient();
    const params: any = {
      model: this.model,
      messages,
    };
    if (opts.tools && opts.tools.length > 0) {
      params.tools = opts.tools;
      params.tool_choice = 'auto';
    }
    if (opts.responseFormat) {
      params.response_format = opts.responseFormat;
    }

    const completion: any = await client.chat.completions.create(params);
    const choice = completion?.choices?.[0];
    const usage = completion?.usage ?? { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
    return {
      message: choice?.message ?? { role: 'assistant', content: '' },
      usage: {
        promptTokens: usage.prompt_tokens || 0,
        completionTokens: usage.completion_tokens || 0,
        totalTokens: usage.total_tokens || 0,
      },
    };
  }
}
