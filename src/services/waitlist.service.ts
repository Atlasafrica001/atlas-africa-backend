import { prisma } from '../lib/prisma';
import { AppError } from '../utils/errors';

export class WaitlistService {
  static getAll(arg0: {
    page: number; limit: number; notified: boolean; /**
 * Get waitlist count
 */ }) {
    throw new Error('Method not implemented.');
  }
  static getStats() {
    throw new Error('Method not implemented.');
  }
  static markAsNotified(id: number) {
    throw new Error('Method not implemented.');
  }
  static delete(id: number) {
    throw new Error('Method not implemented.');
  }
  static exportToCsv(notified: boolean) {
    throw new Error('Method not implemented.');
  }
  /**
   * Add email to waitlist
   */
  async addToWaitlist(email: string, name?: string) {
    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      throw new AppError('Invalid email format', 400);
    }

    // Check if already exists
    const existing = await prisma.waitlist.findUnique({
      where: { email: normalizedEmail }
    });

    if (existing) {
      throw new AppError('This email is already on the waitlist', 409);
    }

    // Add to waitlist
    const waitlistEntry = await prisma.waitlist.create({
      data: {
        email: normalizedEmail,
        name: name?.trim() || null,
      }
    });

    return waitlistEntry;
  }

  /**
   * Get all waitlist entries (admin only)
   */
  async getAllEntries() {
    const entries = await prisma.waitlist.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      }
    });

    return entries;
  }

  /**
   * Get waitlist count
   */
  async getCount() {
    return prisma.waitlist.count();
  }

  /**
   * Delete waitlist entry (admin only)
   */
  async deleteEntry(id: number) {
    const entry = await prisma.waitlist.findUnique({
      where: { id }
    });

    if (!entry) {
      throw new AppError('Waitlist entry not found', 404);
    }

    await prisma.waitlist.delete({
      where: { id }
    });

    return { message: 'Waitlist entry deleted successfully' };
  }

  /**
   * Export waitlist to CSV format
   */
  async exportToCSV() {
    const entries = await prisma.waitlist.findMany({
      orderBy: { createdAt: 'desc' }
    });

    // Create CSV header
    let csv = 'ID,Email,Name,Created At\n';

    // Add entries
    entries.forEach(entry => {
      csv += `${entry.id},"${entry.email}","${entry.name || ''}","${entry.createdAt.toISOString()}"\n`;
    });

    return csv;
  }
}
