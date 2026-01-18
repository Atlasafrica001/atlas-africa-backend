import { prisma } from '../config/database';
import { WaitlistEntry } from '@prisma/client';

export class WaitlistService {
  async create(email: string): Promise<WaitlistEntry> {
    return await prisma.waitlistEntry.create({
      data: { email },
    });
  }

  async getAll(params?: {
    page?: number;
    limit?: number;
    notified?: boolean;
  }) {
    const page = params?.page || 1;
    const limit = params?.limit || 50;
    const skip = (page - 1) * limit;

    const where = params?.notified !== undefined 
      ? { notified: params.notified } 
      : {};

    const [entries, total] = await Promise.all([
      prisma.waitlistEntry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.waitlistEntry.count({ where }),
    ]);

    return {
      entries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async markAsNotified(id: number): Promise<WaitlistEntry> {
    return await prisma.waitlistEntry.update({
      where: { id },
      data: { notified: true },
    });
  }

  async delete(id: number): Promise<void> {
    await prisma.waitlistEntry.delete({ where: { id } });
  }

  async getStats() {
    const total = await prisma.waitlistEntry.count();
    const notified = await prisma.waitlistEntry.count({
      where: { notified: true },
    });
    return {
      total,
      notified,
      pending: total - notified,
    };
  }

  async exportToCsv(notified?: boolean) {
    const where = notified !== undefined ? { notified } : {};
    const entries = await prisma.waitlistEntry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    // Generate CSV
    const headers = 'id,name,email,notified,date\n';
    const rows = entries.map(entry => 
      `${entry.id},"${entry.name}","${entry.email}",${entry.notified},"${entry.createdAt.toISOString()}"`
    ).join('\n');

    return headers + rows;
  }
}

export default new WaitlistService();
