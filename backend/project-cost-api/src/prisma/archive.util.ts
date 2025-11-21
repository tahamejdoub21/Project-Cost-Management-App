// src/prisma/archive.util.ts
import { PrismaService } from './prisma.service';
import { ShadowPrismaService } from './shadow-prisma.service';

export async function archiveDeletedUsers(
  prisma: PrismaService,
  shadowPrisma: ShadowPrismaService,
) {
  const deletedUsers = await prisma.user.findMany({
    where: { deletedAt: { not: null } },
  });

  if (!deletedUsers.length) return;

  console.log(`📦 Archiving ${deletedUsers.length} deleted users...`);

  // Insert into shadow DB
  for (const user of deletedUsers) {
    await shadowPrisma.user.create({ data: user });
  }

  // Optional: Delete from main DB
  await prisma.user.deleteMany({
    where: { deletedAt: { not: null } },
  });

  console.log('✅ Archiving complete.');
}
