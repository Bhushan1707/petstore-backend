const express = require('express');
const { getPets, getPetById, createPet, updatePet, deletePet } = require('../controllers/petController');
const { protect } = require('../middleware/authMiddleware');
const { roleCheck } = require('../middleware/roleMiddleware');
const { body } = require('express-validator');
const upload = require('../middleware/upload');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Pets
 *   description: Pet management
 */

/**
 * @swagger
 * /api/pets:
 *   get:
 *     summary: Get all pets
 *     tags: [Pets]
 *     responses:
 *       200:
 *         description: List of pets
 *   post:
 *     summary: Create a new pet (Admin only)
 *     tags: [Pets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - species
 *               - breed
 *               - age
 *             properties:
 *               name:
 *                 type: string
 *               species:
 *                 type: string
 *               breed:
 *                 type: string
 *               age:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Pet created successfully
 */
router.route('/')
  .get(getPets)
  .post(
    protect, 
    roleCheck('admin'), 
    upload.array('images', 5),
    [
      body('name', 'Name is required').notEmpty(),
      body('species', 'Species is required').notEmpty(),
      body('breed', 'Breed is required').notEmpty(),
      body('age', 'Age must be a number').isNumeric()
    ],
    createPet
  );

/**
 * @swagger
 * /api/pets/{id}:
 *   get:
 *     summary: Get a pet by ID
 *     tags: [Pets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pet details
 *       404:
 *         description: Pet not found
 *   put:
 *     summary: Update a pet (Admin only)
 *     tags: [Pets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               species:
 *                 type: string
 *               breed:
 *                 type: string
 *               age:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Pet updated
 *   delete:
 *     summary: Delete a pet (Admin only)
 *     tags: [Pets]
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
 *         description: Pet deleted
 */
router.route('/:id')
  .get(getPetById)
  .put(protect, roleCheck('admin'), upload.array('images', 5), updatePet)
  .delete(protect, roleCheck('admin'), deletePet);

module.exports = router;
