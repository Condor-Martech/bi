/* eslint-disable no-console */
/**
 * Diagnóstico de SMTP. Usa nodemailer directo con la MISMA config que
 * `MAILER_CONF` en `src/app.config.ts` para aislar el flow del welcome/reset
 * email y verificar que las credenciales + host + puerto funcionen.
 *
 *   npx ts-node scripts/test-smtp.ts                    # envía a APP_MAIL_USER
 *   npx ts-node scripts/test-smtp.ts foo@bar.com        # envía al destinatario indicado
 */
import { config as loadEnv } from 'dotenv';
import { createTransport } from 'nodemailer';
import { resolve } from 'path';

loadEnv({ path: resolve(__dirname, '..', '.env') });

const REQUIRED = ['MAIL_SMTP', 'MAIL_PORT', 'APP_MAIL_USER', 'APP_MAIL_PASS'] as const;

async function main(): Promise<void> {
  const missing = REQUIRED.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    console.error(`[smtp-test] envs ausentes: ${missing.join(', ')}`);
    process.exit(1);
  }

  const host = process.env.MAIL_SMTP!;
  const port = Number(process.env.MAIL_PORT);
  const user = process.env.APP_MAIL_USER!;
  const pass = process.env.APP_MAIL_PASS!;
  const to = process.argv[2] ?? user;
  // Lee exactamente las MISMAS envs que `MAILER_CONF` en `src/app.config.ts`.
  // Así el resultado del script es 1:1 con el comportamiento de la app.
  const minTls = (process.env.MAIL_MIN_TLS ?? 'TLSv1.2') as
    | 'TLSv1'
    | 'TLSv1.1'
    | 'TLSv1.2'
    | 'TLSv1.3';
  const ciphers = process.env.MAIL_CIPHERS;

  console.log(`[smtp-test] host=${host} port=${port} user=${user} minTLS=${minTls} ciphers=${ciphers ?? '<default>'}`);
  console.log(`[smtp-test] destinatario=${to}`);

  const transporter = createTransport({
    host,
    port,
    ignoreTLS: false,
    secure: false,
    auth: { user, pass },
    tls: { minVersion: minTls, rejectUnauthorized: false, ...(ciphers ? { ciphers } : {}) },
    logger: true,
    debug: true,
  });

  console.log('[smtp-test] verificando conexión + auth...');
  await transporter.verify();
  console.log('[smtp-test] verify OK — conexión y credenciales válidas');

  console.log('[smtp-test] enviando mensaje de prueba...');
  const info = await transporter.sendMail({
    from: '"Plataforma Condor BI" <web@condor.com.br>',
    to,
    subject: '[BI] Test SMTP',
    text: `Prueba de SMTP enviada el ${new Date().toISOString()} desde scripts/test-smtp.ts.`,
  });

  console.log(`[smtp-test] enviado messageId=${info.messageId}`);
  if (info.accepted?.length) console.log(`[smtp-test] accepted=${info.accepted.join(', ')}`);
  if (info.rejected?.length) console.warn(`[smtp-test] rejected=${info.rejected.join(', ')}`);
  if (info.response) console.log(`[smtp-test] response=${info.response}`);
}

main().catch((err) => {
  console.error('[smtp-test] FAILED');
  console.error(err);
  process.exit(1);
});
