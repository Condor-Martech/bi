import * as fsPromises from 'fs/promises';
import { execFile } from 'child_process';
import { join, basename } from 'path';
import { Injectable, Logger } from '@nestjs/common';
import { promisify } from 'util';
import { BACKUP_DIR, BACKUP_RETENTION, PRERESTORE_RETENTION } from './backup.config';

const execFileAsync = promisify(execFile);

const ARCHIVE_SUFFIX = '.bson.gz';
// Só aceita nomes gerados por este serviço — usado para validar entrada vinda da API.
const ARCHIVE_NAME_RE = /^(backup|prerestore)_[\w.\-:]+\.bson\.gz$/;

type ArchivePrefix = 'backup' | 'prerestore';

export interface BackupFileInfo {
    name: string;
    sizeBytes: number;
    createdAt: Date;
}

@Injectable()
export class BackupService {
    private readonly logger = new Logger(BackupService.name);

    /**
     * Gera um dump completo do MongoDB via `mongodump`.
     * LANÇA em caso de falha — não engole o erro, para que o agendador/endpoint saibam.
     * @param prefix 'backup' (diário, com retenção) ou 'prerestore' (snapshot de segurança).
     * @returns caminho do arquivo gerado.
     */
    async backup(prefix: ArchivePrefix = 'backup'): Promise<string> {
        const dsn = process.env.MONGO_DSN;
        if (!dsn) {
            throw new Error('MONGO_DSN não configurado — backup abortado.');
        }

        const formattedDate = new Date().toISOString().replace(/:/g, '-');
        const fileName = `${prefix}_${formattedDate}${ARCHIVE_SUFFIX}`;
        const filePath = join(BACKUP_DIR, fileName);

        await fsPromises.mkdir(BACKUP_DIR, { recursive: true });

        try {
            await execFileAsync('mongodump', [
                '--uri', dsn,
                `--archive=${filePath}`,
                '--gzip',
            ]);
        } catch (error) {
            await this.safeUnlink(filePath);
            throw new Error(`Falha ao executar mongodump: ${error?.stderr ?? error?.message ?? error}`);
        }

        // Verifica que o arquivo existe e não está vazio antes de considerar o backup válido.
        const stat = await fsPromises.stat(filePath).catch(() => null);
        if (!stat || stat.size === 0) {
            await this.safeUnlink(filePath);
            throw new Error(`Backup inválido: arquivo ausente ou vazio (${filePath}).`);
        }

        await this.prune(prefix, prefix === 'backup' ? BACKUP_RETENTION : PRERESTORE_RETENTION);

        this.logger.log(`Backup gerado: ${filePath} (${stat.size} bytes)`);
        return filePath;
    }

    /** Lista os arquivos de backup disponíveis, do mais recente para o mais antigo. */
    async listBackups(): Promise<BackupFileInfo[]> {
        const files = await this.readArchives();
        const infos = await Promise.all(
            files.map(async (name) => {
                const stat = await fsPromises.stat(join(BACKUP_DIR, name));
                return { name, sizeBytes: stat.size, createdAt: stat.mtime };
            }),
        );
        return infos.sort((a, b) => b.name.localeCompare(a.name));
    }

    /**
     * Restaura um backup específico. Antes do `mongorestore --drop` destrutivo,
     * gera um snapshot de segurança para que a operação seja reversível.
     * LANÇA em caso de falha.
     */
    async restoreBackup(fileName: string): Promise<void> {
        const dsn = process.env.MONGO_DSN;
        if (!dsn) {
            throw new Error('MONGO_DSN não configurado — restauração abortada.');
        }

        // Previne path traversal vindo da API: aceita só o basename e o padrão esperado.
        const safeName = basename(fileName ?? '');
        if (!ARCHIVE_NAME_RE.test(safeName)) {
            throw new Error(`Nome de backup inválido: ${fileName}`);
        }

        const filePath = join(BACKUP_DIR, safeName);
        const exists = await fsPromises.stat(filePath).then(() => true).catch(() => false);
        if (!exists) {
            throw new Error(`Backup não encontrado: ${safeName}`);
        }

        // Snapshot de segurança ANTES do --drop destrutivo — um restore ruim é reversível.
        const safetySnapshot = await this.backup('prerestore');
        this.logger.warn(`Snapshot de segurança criado antes da restauração: ${safetySnapshot}`);

        await this.runMongorestore(filePath, dsn);
        this.logger.log(`Restauração concluída a partir de: ${safeName}`);
    }

    private async runMongorestore(filePath: string, dsn: string): Promise<void> {
        try {
            await execFileAsync('mongorestore', [
                '--uri', dsn,
                '--drop',
                '--gzip',
                `--archive=${filePath}`,
            ]);
        } catch (error) {
            throw new Error(`Falha ao executar mongorestore: ${error?.stderr ?? error?.message ?? error}`);
        }
    }

    /** Mantém os `keep` arquivos mais recentes do prefixo dado; remove o restante. */
    private async prune(prefix: ArchivePrefix, keep: number): Promise<void> {
        const files = (await this.readArchives())
            .filter((name) => name.startsWith(`${prefix}_`))
            .sort(); // timestamps ISO ordenam cronologicamente

        const toDelete = files.slice(0, Math.max(0, files.length - keep));
        for (const name of toDelete) {
            await this.safeUnlink(join(BACKUP_DIR, name));
        }
        if (toDelete.length > 0) {
            this.logger.log(`Retenção (${prefix}): ${toDelete.length} arquivo(s) antigo(s) removido(s).`);
        }
    }

    private async readArchives(): Promise<string[]> {
        const files = await fsPromises.readdir(BACKUP_DIR).catch(() => [] as string[]);
        return files.filter((name) => ARCHIVE_NAME_RE.test(name));
    }

    private async safeUnlink(filePath: string): Promise<void> {
        await fsPromises.unlink(filePath).catch(() => undefined);
    }
}
