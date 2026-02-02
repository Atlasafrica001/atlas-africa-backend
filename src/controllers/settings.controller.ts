import { Request, Response } from 'express';
import { SettingsService } from '../services/settings.service';
import { asyncHandler } from '../utils/asyncHandler';

const settingsService = new SettingsService();

export class SettingsController {
  /**
   * Get all settings
   */
  getAllSettings = asyncHandler(async (req: Request, res: Response) => {
    const settings = await settingsService.getAllSettings();

    res.status(200).json({
      success: true,
      data: { settings }
    });
  });

  /**
   * Get single setting
   */
  getSetting = asyncHandler(async (req: Request, res: Response) => {
    const { key } = req.params;
    const setting = await settingsService.getSetting(key);

    res.status(200).json({
      success: true,
      data: { setting }
    });
  });

  /**
   * Update or create setting
   */
  upsertSetting = asyncHandler(async (req: Request, res: Response) => {
    const { key } = req.params;
    const { value, type, description } = req.body;

    const setting = await settingsService.upsertSetting(key, value, type, description);

    res.status(200).json({
      success: true,
      data: { setting }
    });
  });

  /**
   * Update multiple settings
   */
  updateMultipleSettings = asyncHandler(async (req: Request, res: Response) => {
    const { settings } = req.body;

    const result = await settingsService.updateMultipleSettings(settings);

    res.status(200).json({
      success: true,
      data: result
    });
  });

  /**
   * Delete setting
   */
  deleteSetting = asyncHandler(async (req: Request, res: Response) => {
    const { key } = req.params;
    const result = await settingsService.deleteSetting(key);

    res.status(200).json({
      success: true,
      data: result
    });
  });

  /**
   * Initialize default settings
   */
  initializeSettings = asyncHandler(async (req: Request, res: Response) => {
    const result = await settingsService.initializeDefaultSettings();

    res.status(200).json({
      success: true,
      data: result
    });
  });
}
