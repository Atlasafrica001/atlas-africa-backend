import { Request, Response } from 'express';
import { WaitlistService } from '../services/waitlist.service';
import { asyncHandler } from '../utils/asyncHandler';
import { RateLimitRequestHandler } from 'express-rate-limit';

const waitlistService = new WaitlistService();

export class WaitlistController {
  static create(arg0: string, waitlistRateLimiter: RateLimitRequestHandler, arg2: (req: Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>, next: import("express").NextFunction) => void, create: any) {
    throw new Error('Method not implemented.');
  }
  /**
   * Add to waitlist (Public)
   */
  addToWaitlist = asyncHandler(async (req: Request, res: Response) => {
    const { email, name } = req.body;

    const entry = await waitlistService.addToWaitlist(email, name);

    res.status(201).json({
      success: true,
      data: {
        message: 'Successfully added to waitlist!',
        entry: {
          id: entry.id,
          email: entry.email,
          name: entry.name,
        }
      }
    });
  });

  /**
   * Get all waitlist entries (Admin only)
   */
  getAllEntries = asyncHandler(async (req: Request, res: Response) => {
    const entries = await waitlistService.getAllEntries();

    res.status(200).json({
      success: true,
      data: {
        entries,
        total: entries.length
      }
    });
  });

  /**
   * Get waitlist count (Admin only)
   */
  getCount = asyncHandler(async (req: Request, res: Response) => {
    const count = await waitlistService.getCount();

    res.status(200).json({
      success: true,
      data: { count }
    });
  });

  /**
   * Delete entry (Admin only)
   */
  deleteEntry = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await waitlistService.deleteEntry(parseInt(id));

    res.status(200).json({
      success: true,
      data: result
    });
  });

  /**
   * Export to CSV (Admin only)
   */
  exportCSV = asyncHandler(async (req: Request, res: Response) => {
    const csv = await waitlistService.exportToCSV();

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=waitlist-export.csv');
    res.status(200).send(csv);
  });
}
