import { Router } from 'express';
import { ConsultationController } from '../controllers/consultation.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const consultationController = new ConsultationController();

/**
 * All routes require authentication
 */

/**
 * @route   GET /api/v1/admin/consultations
 * @desc    Get all consultation requests
 * @access  Private (Admin)
 */
router.get('/', authMiddleware, consultationController.getAllConsultations);

/**
 * @route   GET /api/v1/admin/consultations/stats
 * @desc    Get consultation statistics
 * @access  Private (Admin)
 */
router.get('/stats', authMiddleware, consultationController.getStats);

/**
 * @route   GET /api/v1/admin/consultations/:id
 * @desc    Get single consultation by ID
 * @access  Private (Admin)
 */
router.get('/:id', authMiddleware, consultationController.getConsultationById);

/**
 * @route   PATCH /api/v1/admin/consultations/:id/status
 * @desc    Update consultation status
 * @access  Private (Admin)
 */
router.patch('/:id/status', authMiddleware, consultationController.updateStatus);

/**
 * @route   PATCH /api/v1/admin/consultations/:id/notes
 * @desc    Add notes to consultation
 * @access  Private (Admin)
 */
router.patch('/:id/notes', authMiddleware, consultationController.addNotes);

/**
 * @route   PATCH /api/v1/admin/consultations/:id/contact
 * @desc    Mark consultation as contacted
 * @access  Private (Admin)
 */
router.patch('/:id/contact', authMiddleware, consultationController.markAsContacted);

/**
 * @route   DELETE /api/v1/admin/consultations/:id
 * @desc    Delete consultation
 * @access  Private (Admin)
 */
router.delete('/:id', authMiddleware, consultationController.deleteConsultation);

export default router;
