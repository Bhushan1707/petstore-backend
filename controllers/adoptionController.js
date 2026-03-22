const Adoption = require('../models/Adoption');
const Pet = require('../models/Pet');

const applyAdoption = async (req, res) => {
  try {
    const petId = req.params.petId;
    const applicantId = req.user._id;

    const pet = await Pet.findById(petId);
    if (!pet) return res.status(404).json({ success: false, message: 'Pet not found' });
    
    if (pet.status !== 'available') {
      return res.status(400).json({ success: false, message: 'Pet is not available for adoption' });
    }

    const existingApplication = await Adoption.findOne({ pet: petId, applicant: applicantId });
    if (existingApplication) {
      return res.status(400).json({ success: false, message: 'You have already applied for this pet' });
    }

    const application = await Adoption.create({
      pet: petId,
      applicant: applicantId,
      message: req.body.message
    });

    pet.status = 'pending';
    await pet.save();

    res.status(201).json({ success: true, data: application, message: 'Application submitted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMyApplications = async (req, res) => {
  try {
    const applications = await Adoption.find({ applicant: req.user._id }).populate('pet').populate('applicant', 'name email');
    res.status(200).json({ success: true, data: applications, message: 'My applications retrieved' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllApplications = async (req, res) => {
  try {
    const applications = await Adoption.find().populate('pet').populate('applicant', 'name email');
    res.status(200).json({ success: true, data: applications, message: 'All applications retrieved' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const approveApplication = async (req, res) => {
  try {
    const application = await Adoption.findById(req.params.id);
    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

    application.status = 'approved';
    await application.save();

    const pet = await Pet.findById(application.pet);
    if (pet) {
      pet.status = 'adopted';
      await pet.save();
    }

    res.status(200).json({ success: true, data: application, message: 'Application approved' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const rejectApplication = async (req, res) => {
  try {
    const application = await Adoption.findById(req.params.id);
    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

    application.status = 'rejected';
    await application.save();

    const pet = await Pet.findById(application.pet);
    if (pet) {
      pet.status = 'available';
      await pet.save();
    }

    res.status(200).json({ success: true, data: application, message: 'Application rejected' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { applyAdoption, getMyApplications, getAllApplications, approveApplication, rejectApplication };
