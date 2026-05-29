/* eslint-disable no-console */
/**
 * Backfill `users.lastLogin` desde `login-log`.
 *
 *   npx ts-node -r tsconfig-paths/register scripts/backfill-last-login.ts
 *
 * Idempotente: solo actualiza si el `max(loginTime)` calculado es mayor al
 * `lastLogin` actual. Antes de correr: backup de la colección `users`.
 */
import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { AppModule } from '../src/app.module';
import { LoginLog, LoginDocument } from '../src/app/modules/login-log/login-log.entity';
import { User, UserDocument } from '../src/app/modules/users/user.entity';

async function main(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn'] });
  try {
    const loginModel = app.get<Model<LoginDocument>>(getModelToken(LoginLog.name));
    const userModel = app.get<Model<UserDocument>>(getModelToken(User.name));

    const logs = await loginModel.find().lean().exec();
    console.log(`[backfill] login-log entries: ${logs.length}`);

    // Agrupar por userId y quedarme con el max(loginTime). loginTime se guarda
    // como string toString() de Date — Date.parse maneja ese formato.
    const latestByUser = new Map<string, Date>();
    let skippedUnparseable = 0;
    for (const log of logs) {
      const raw = (log as any).userId;
      const userId: string | undefined = Array.isArray(raw)
        ? raw[0]?.toString()
        : raw?.toString();
      if (!userId) continue;

      const parsedMs = Date.parse((log as any).loginTime);
      if (Number.isNaN(parsedMs)) {
        skippedUnparseable += 1;
        continue;
      }
      const ts = new Date(parsedMs);
      const current = latestByUser.get(userId);
      if (!current || ts > current) latestByUser.set(userId, ts);
    }
    console.log(`[backfill] users with at least one parseable login: ${latestByUser.size}`);
    if (skippedUnparseable > 0) {
      console.warn(`[backfill] skipped unparseable loginTime entries: ${skippedUnparseable}`);
    }

    let updated = 0;
    let unchanged = 0;
    let missingUser = 0;
    for (const [userId, ts] of latestByUser) {
      const res = await userModel
        .updateOne(
          {
            _id: new Types.ObjectId(userId),
            $or: [{ lastLogin: { $exists: false } }, { lastLogin: null }, { lastLogin: { $lt: ts } }],
          },
          { $set: { lastLogin: ts } },
        )
        .exec();
      if (res.matchedCount === 0) {
        const exists = await userModel.exists({ _id: new Types.ObjectId(userId) }).exec();
        if (!exists) missingUser += 1;
        else unchanged += 1;
      } else if (res.modifiedCount > 0) {
        updated += 1;
      } else {
        unchanged += 1;
      }
    }

    const usersWithoutHistory = await userModel
      .countDocuments({ $or: [{ lastLogin: { $exists: false } }, { lastLogin: null }] })
      .exec();

    console.log(`[backfill] updated: ${updated}`);
    console.log(`[backfill] already up-to-date: ${unchanged}`);
    console.log(`[backfill] log entries pointing to missing user: ${missingUser}`);
    console.log(`[backfill] users still without lastLogin: ${usersWithoutHistory}`);
  } finally {
    await app.close();
  }
}

main().catch((err) => {
  console.error('[backfill] failed', err);
  process.exit(1);
});
