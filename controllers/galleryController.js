const fs = require('fs');
const path = require('path');
const PetGallery = require('../models/PetGallery');
const Pet = require('../models/Pet');

// @desc    Upload images for a pet
// @route   POST /api/gallery/:petId
// @access  Private/Admin
const uploadImages = async (req, res) => {
  try {
    const { petId } = req.params;

    // Verify pet exists
    const pet = await Pet.findById(petId);
    if (!pet) {
      return res.status(404).json({ success: false, message: 'Pet not found' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No images uploaded' });
    }

    // Save each uploaded file to PetGallery
    const galleryDocs = req.files.map((file) => ({
      petId,
      imagePath: `assets/uploads/${file.filename}`,
      originalName: file.originalname,
    }));

    const saved = await PetGallery.insertMany(galleryDocs);

    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all gallery images for a pet
// @route   GET /api/gallery/:petId
// @access  Public
const getGalleryByPet = async (req, res) => {
  try {
    const { petId } = req.params;
    const images = await PetGallery.find({ petId }).sort({ createdAt: -1 });
    res.json({ success: true, data: images });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a gallery image
// @route   DELETE /api/gallery/:imageId
// @access  Private/Admin
const deleteGalleryImage = async (req, res) => {
  try {
    const image = await PetGallery.findById(req.params.imageId);
    if (!image) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }

    // Delete file from disk
    const filePath = path.join(__dirname, '..', image.imagePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await image.deleteOne();
    res.json({ success: true, message: 'Image deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { uploadImages, getGalleryByPet, deleteGalleryImage };
