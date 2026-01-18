import { prisma } from '../config/database';
import { ConsultationRequest, ConsultationStatus } from '@prisma/client';
import { ConsultationSubmission, UpdateConsultationStatus } from '../types/request.types';

export class ConsultationService {
  async create(data: ConsultationSubmission): Promise<ConsultationRequest> {
    return await prisma.consultationRequest.create({
      data,
    });
  }

  async getAll(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) {
    const page = params?.page || 1;
    const limit = params?.limit || 50;
    const skip = (page - 1) * limit;

    const where = params?.status 
      ? { status: params.status.toUpperCase() as ConsultationStatus }
      : {};

    const [consultations, total] = await Promise.all([
      prisma.consultationRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.consultationRequest.count({ where }),
    ]);

    return {
      consultations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getById(id: number): Promise<ConsultationRequest | null> {
    return await prisma.consultationRequest.findUnique({
      where: { id },
    });
  }

  async updateStatus(
    id: number,
    data: UpdateConsultationStatus
  ): Promise<ConsultationRequest> {
    return await prisma.consultationRequest.update({
      where: { id },
      data: {
        status: data.status.toUpperCase() as ConsultationStatus,
        adminNotes: data.adminNotes,
      },
    });
  }

  async getStats() {
    const total = await prisma.consultationRequest.count();
    const pending = await prisma.consultationRequest.count({
      where: { status: 'PENDING' },
    });
    const contacted = await prisma.consultationRequest.count({
      where: { status: 'CONTACTED' },
    });
    const converted = await prisma.consultationRequest.count({
      where: { status: 'CONVERTED' },
    });

    // Calculate new this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const newThisMonth = await prisma.consultationRequest.count({
      where: {
        createdAt: { gte: startOfMonth },
      },
    });

    return { total, pending, contacted, converted, newThisMonth };
  }

  async exportToCsv(status?: string) {
    const where = status 
      ? { status: status.toUpperCase() as ConsultationStatus }
      : {};

    const consultations = await prisma.consultationRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    // Generate CSV
    const headers = 'id,fullName,email,company,phone,status,date\n';
    const rows = consultations.map(c => 
      `${c.id},"${c.fullName}","${c.email}","${c.company}","${c.phone}",${c.status},"${c.createdAt.toISOString()}"`
    ).join('\n');

    return headers + rows;
  }
}

export default new ConsultationService();
