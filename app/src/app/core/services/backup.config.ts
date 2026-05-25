// Configuração do subsistema de backup.
//
// Mantida em arquivo próprio (e NÃO em app.config.ts) de propósito: app.config.ts
// importa `BackupService` para o array `PROVIDER`. Se backup.service.ts importasse
// app.config.ts, formaria um ciclo de imports — e, conforme a ordem de carregamento
// dos módulos, `BackupService` poderia ser resolvido como `undefined` ao montar
// `PROVIDER`, derrubando a aplicação no boot. Este arquivo não importa nada, então
// não há ciclo.

// Diretório de backups — FORA de `public/`, portanto NÃO é exposto pelo ServeStaticModule.
export const BACKUP_DIR = process.env.BACKUP_DIR ?? './storage/backups';

// Quantos backups diários manter; o restante é removido após cada backup bem-sucedido.
export const BACKUP_RETENTION = Number(process.env.BACKUP_RETENTION) || 7;

// Quantos snapshots de segurança pré-restauração manter.
export const PRERESTORE_RETENTION = Number(process.env.PRERESTORE_RETENTION) || 3;
