import { Router } from 'express';
import { SettingsController } from '../controllers/settings.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const settingsController = new SettingsController();

/**
 * All routes require authentication
 */

/**
 * @route   GET /api/v1/admin/settings
 * @desc    Get all settings
 * @access  Private (Admin)
 */
router.get('/', authMiddleware, settingsController.getAllSettings);

/**
 * @route   POST /api/v1/admin/settings/initialize
 * @desc    Initialize default settings
 * @access  Private (Admin)
 */
router.post('/initialize', authMiddleware, settingsController.initializeSettings);

/**
 * @route   PUT /api/v1/admin/settings
 * @desc    Update multiple settings at once
 * @access  Private (Admin)
 */
router.put('/', authMiddleware, settingsController.updateMultipleSettings);

/**
 * @route   GET /api/v1/admin/settings/:key
 * @desc    Get single setting
 * @access  Private (Admin)
 */
router.get('/:key', authMiddleware, settingsController.getSetting);

/**
 * @route   PUT /api/v1/admin/settings/:key
 * @desc    Update or create setting
 * @access  Private (Admin)
 */
router.put('/:key', authMiddleware, settingsController.upsertSetting);

/**
 * @route   DELETE /api/v1/admin/settings/:key
 * @desc    Delete setting
 * @access  Private (Admin)
 */
router.delete('/:key', authMiddleware, settingsController.deleteSetting);

export default router;
