const fs = require('fs');
const path = require('path');
const Pet = require('../models/Pet');
const PetGallery = require('../models/PetGallery');
const { validationResult } = require('express-validator');

const getPets = async (req, res) => {
  try {
    const { search, species, breed, age, page = 1, limit = 8 } = req.query;
    
    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { breed: { $regex: search, $options: 'i' } }
      ];
    }
    if (species) query.species = species;
    if (breed) query.breed = breed;
    if (age) query.age = { $lte: parseInt(age) };

    const skip = (page - 1) * limit;

    const pets = await Pet.find(query).skip(parseInt(skip)).limit(parseInt(limit));
    const total = await Pet.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        pets,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      },
      message: 'Pets retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPetById = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ success: false, message: 'Pet not found' });
    res.status(200).json({ success: true, data: pet, message: 'Pet details retrieved' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createPet = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, message: errors.array()[0].msg });

  try {
    console.log("body<<<<",req.body)
    if (req.files && req.files.length > 0) {
      const newUrls = req.files.map((file) => `assets/uploads/${file.filename}`);
      if (req.body.photoUrls) {
        if (!Array.isArray(req.body.photoUrls)) req.body.photoUrls = [req.body.photoUrls];
        req.body.photoUrls = [...req.body.photoUrls, ...newUrls];
      } else {
        req.body.photoUrls = newUrls;
      }
    }
    const pet = await Pet.create(req.body);
    res.status(201).json({ success: true, data: pet, message: 'Pet created successfully' });
  } catch (error) {
    console.log("error<<",error)
    res.status(500).json({ success: false, message: error.message });
  }
};

const updatePet = async (req, res) => {
  try {
    const existingPet = await Pet.findById(req.params.id);
    if (!existingPet) return res.status(404).json({ success: false, message: 'Pet not found' });

    // Handle new file uploads
    if (req.files && req.files.length > 0) {
      const newUrls = req.files.map((file) => `assets/uploads/${file.filename}`);
      if (req.body.photoUrls) {
        if (!Array.isArray(req.body.photoUrls)) req.body.photoUrls = [req.body.photoUrls];
        req.body.photoUrls = [...req.body.photoUrls, ...newUrls];
      } else {
        req.body.photoUrls = [...existingPet.photoUrls, ...newUrls];
      }
    }

    // Cleanup deleted photos from filesystem
    if (req.body.photoUrls) {
      const newPhotoUrls = Array.isArray(req.body.photoUrls) ? req.body.photoUrls : [req.body.photoUrls];
      const removedPhotos = existingPet.photoUrls.filter(url => !newPhotoUrls.includes(url));

      removedPhotos.forEach(url => {
        const filePath = path.join(__dirname, '..', url);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }

    const pet = await Pet.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: pet, message: 'Pet updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deletePet = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ success: false, message: 'Pet not found' });

    // 1. Delete main photo files
    pet.photoUrls.forEach(url => {
      const filePath = path.join(__dirname, '..', url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    // 2. Delete gallery images (disk and DB)
    const galleryItems = await PetGallery.find({ petId: pet._id });
    galleryItems.forEach(item => {
      const filePath = path.join(__dirname, '..', item.imagePath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
    await PetGallery.deleteMany({ petId: pet._id });

    // 3. Delete the pet record
    await pet.deleteOne();
    
    res.status(200).json({ success: true, data: {}, message: 'Pet and all associated images deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getPets, getPetById, createPet, updatePet, deletePet };
