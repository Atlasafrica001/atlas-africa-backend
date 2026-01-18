import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/response.util';
import consultationService from '../services/consultation.service';

export class ConsultationController {
  async create(req: Request, res: Response): Promise<void> {
    try {
      const consultation = await consultationService.create(req.body);
      sendSuccess(
        res,
        consultation,
        "Consultation request submitted successfully! We'll get back to you within 24 hours.",
        201
      );
    } catch (error: any) {
      console.error('Consultation creation error:', error);
      sendError(res, 'INTERNAL_SERVER_ERROR', 'Failed to submit consultation request', 500);
    }
  }
}

export default new ConsultationController();
