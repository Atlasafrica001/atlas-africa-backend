import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/response.util';
import waitlistService from '../services/waitlist.service';

export class WaitlistController {
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      const entry = await waitlistService.create(email);
      sendSuccess(res, entry, 'Successfully added to waitlist!', 201);
    } catch (error: any) {
      console.error('Waitlist creation error:', error);
      if (error.code === 'P2002') {
        sendError(res, 'DUPLICATE_EMAIL', 'This email is already on the waitlist', 409);
      } else {
        sendError(res, 'INTERNAL_SERVER_ERROR', 'Failed to add to waitlist', 500);
      }
    }
  }
}

export default new WaitlistController();
