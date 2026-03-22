const express = require('express');
const { applyAdoption, getMyApplications, getAllApplications, approveApplication, rejectApplication } = require('../controllers/adoptionController');
const { protect } = require('../middleware/authMiddleware');
const { roleCheck } = require('../middleware/roleMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Adoptions
 *   description: Adoption application management
 */

/**
 * @swagger
 * /api/adoptions/apply/{petId}:
 *   post:
 *     summary: Apply for pet adoption
 *     tags: [Adoptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: petId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Application submitted successfully
 */
router.post('/apply/:petId', protect, applyAdoption);

/**
 * @swagger
 * /api/adoptions/my-applications:
 *   get:
 *     summary: Get user's adoption applications
 *     tags: [Adoptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user applications
 */
router.get('/my-applications', protect, getMyApplications);

/**
 * @swagger
 * /api/adoptions:
 *   get:
 *     summary: Get all adoption applications (Admin only)
 *     tags: [Adoptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all applications
 */
router.get('/', protect, roleCheck('admin'), getAllApplications);

/**
 * @swagger
 * /api/adoptions/{id}/approve:
 *   put:
 *     summary: Approve an adoption application (Admin only)
 *     tags: [Adoptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Application approved
 */
router.put('/:id/approve', protect, roleCheck('admin'), approveApplication);

/**
 * @swagger
 * /api/adoptions/{id}/reject:
 *   put:
 *     summary: Reject an adoption application (Admin only)
 *     tags: [Adoptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Application rejected
 */
router.put('/:id/reject', protect, roleCheck('admin'), rejectApplication);

module.exports = router;
