const mongoose = require('mongoose');

const petGallerySchema = new mongoose.Schema(
  {
    petId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pet',
      required: true,
    },
    imagePath: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PetGallery', petGallerySchema);
