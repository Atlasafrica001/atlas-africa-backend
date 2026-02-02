import { Request, Response } from 'express';
import { ConsultationService } from '../services/consultation.service';
import { asyncHandler } from '../utils/asyncHandler';

const consultationService = new ConsultationService();

export class ConsultationController {
  /**
   * Get all consultations
   */
  getAllConsultations = asyncHandler(async (req: Request, res: Response) => {
    const filters = {
      status: req.query.status as string,
      search: req.query.search as string,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset as string) : undefined
    };

    const result = await consultationService.getAllConsultations(filters);

    res.status(200).json({
      success: true,
      data: result
    });
  });

  /**
   * Get single consultation
   */
  getConsultationById = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const consultation = await consultationService.getConsultationById(id);

    res.status(200).json({
      success: true,
      data: { consultation }
    });
  });

  /**
   * Update consultation status
   */
  updateStatus = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const { status } = req.body;

    const consultation = await consultationService.updateStatus(id, status);

    res.status(200).json({
      success: true,
      data: { consultation }
    });
  });

  /**
   * Add notes to consultation
   */
  addNotes = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const { notes } = req.body;

    const consultation = await consultationService.addNotes(id, notes);

    res.status(200).json({
      success: true,
      data: { consultation }
    });
  });

  /**
   * Delete consultation
   */
  deleteConsultation = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const result = await consultationService.deleteConsultation(id);

    res.status(200).json({
      success: true,
      data: result
    });
  });

  /**
   * Get consultation statistics
   */
  getStats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await consultationService.getConsultationStats();

    res.status(200).json({
      success: true,
      data: stats
    });
  });

  /**
   * Mark as contacted
   */
  markAsContacted = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const consultation = await consultationService.markAsContacted(id);

    res.status(200).json({
      success: true,
      data: { consultation }
    });
  });
}
