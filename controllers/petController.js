const Pet = require('../models/Pet');
const { validationResult } = require('express-validator');

const getPets = async (req, res) => {
  try {
    const { search, species, breed, age, page = 1, limit = 10 } = req.query;
    
    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { breed: { $regex: search, $options: 'i' } }
      ];
    }
    if (species) query.species = species;
    if (breed) query.breed = breed;
    if (age) query.age = age;

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
    if (req.files && req.files.length > 0) {
      const newUrls = req.files.map((file) => `assets/uploads/${file.filename}`);
      if (req.body.photoUrls) {
        if (!Array.isArray(req.body.photoUrls)) req.body.photoUrls = [req.body.photoUrls];
        req.body.photoUrls = [...req.body.photoUrls, ...newUrls];
      } else {
        req.body.photoUrls = newUrls;
      }
    }
    const pet = await Pet.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!pet) return res.status(404).json({ success: false, message: 'Pet not found' });
    res.status(200).json({ success: true, data: pet, message: 'Pet updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deletePet = async (req, res) => {
  try {
    const pet = await Pet.findByIdAndDelete(req.params.id);
    if (!pet) return res.status(404).json({ success: false, message: 'Pet not found' });
    res.status(200).json({ success: true, data: {}, message: 'Pet deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getPets, getPetById, createPet, updatePet, deletePet };
