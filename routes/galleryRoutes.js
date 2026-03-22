const express = require('express');
const { uploadImages, getGalleryByPet, deleteGalleryImage } = require('../controllers/galleryController');
const { protect } = require('../middleware/authMiddleware');
const { roleCheck } = require('../middleware/roleMiddleware');
const upload = require('../middleware/upload');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Gallery
 *   description: Pet image gallery
 */

/**
 * @swagger
 * /api/gallery/{petId}:
 *   get:
 *     summary: Get all gallery images for a pet
 *     tags: [Gallery]
 *     parameters:
 *       - in: path
 *         name: petId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of gallery images
 *   post:
 *     summary: Upload images for a pet (Admin only)
 *     tags: [Gallery]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: petId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Images uploaded successfully
 */
router
  .route('/:petId')
  .get(getGalleryByPet)
  .post(protect, roleCheck('admin'), upload.array('images', 5), uploadImages);

/**
 * @swagger
 * /api/gallery/image/{imageId}:
 *   delete:
 *     summary: Delete a gallery image (Admin only)
 *     tags: [Gallery]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Image deleted
 */
router.delete('/image/:imageId', protect, roleCheck('admin'), deleteGalleryImage);

module.exports = router;
