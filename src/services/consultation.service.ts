import { prisma } from '../lib/prisma';
import { AppError } from '../utils/errors';

export class ConsultationService {
  /**
   * Get all consultation requests
   */
  async getAllConsultations(filters?: {
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    const { status, search, limit = 50, offset = 0 } = filters || {};

    const where: any = {};

    // Filter by status if provided
    if (status) {
      where.status = status;
    }

    // Search by name or email or company
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [consultations, total] = await Promise.all([
      prisma.consultationRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      }),
      prisma.consultationRequest.count({ where })
    ]);

    return { consultations, total };
  }

  /**
   * Get single consultation by ID
   */
  async getConsultationById(id: number) {
    const consultation = await prisma.consultationRequest.findUnique({
      where: { id }
    });

    if (!consultation) {
      throw new AppError('Consultation request not found', 404);
    }

    return consultation;
  }

  /**
   * Update consultation status
   */
  async updateStatus(id: number, status: string) {
    const validStatuses = ['PENDING', 'CONTACTED', 'CONVERTED'];
    
    if (!validStatuses.includes(status)) {
      throw new AppError('Invalid status. Must be PENDING, CONTACTED, or CONVERTED', 400);
    }

    const consultation = await prisma.consultationRequest.findUnique({
      where: { id }
    });

    if (!consultation) {
      throw new AppError('Consultation request not found', 404);
    }

    const updated = await prisma.consultationRequest.update({
      where: { id },
      data: { status: status as any }
    });

    return updated;
  }

  /**
   * Add admin notes to consultation
   */
  async addNotes(id: number, notes: string) {
    const consultation = await prisma.consultationRequest.findUnique({
      where: { id }
    });

    if (!consultation) {
      throw new AppError('Consultation request not found', 404);
    }

    const updated = await prisma.consultationRequest.update({
      where: { id },
      data: { adminNotes: notes }
    });

    return updated;
  }

  /**
   * Delete consultation
   */
  async deleteConsultation(id: number) {
    const consultation = await prisma.consultationRequest.findUnique({
      where: { id }
    });

    if (!consultation) {
      throw new AppError('Consultation request not found', 404);
    }

    await prisma.consultationRequest.delete({
      where: { id }
    });

    return { message: 'Consultation deleted successfully' };
  }

  /**
   * Get consultation statistics
   */
  async getConsultationStats() {
    const [total, pending, contacted, converted] = await Promise.all([
      prisma.consultationRequest.count(),
      prisma.consultationRequest.count({ where: { status: 'PENDING' } }),
      prisma.consultationRequest.count({ where: { status: 'CONTACTED' } }),
      prisma.consultationRequest.count({ where: { status: 'CONVERTED' } })
    ]);

    return {
      total,
      pending,
      contacted,
      converted
    };
  }

  /**
   * Mark consultation as contacted
   */
  async markAsContacted(id: number) {
    const consultation = await prisma.consultationRequest.findUnique({
      where: { id }
    });

    if (!consultation) {
      throw new AppError('Consultation request not found', 404);
    }

    const updated = await prisma.consultationRequest.update({
      where: { id },
      data: { 
        status: 'CONTACTED'
      }
    });

    return updated;
  }
}
