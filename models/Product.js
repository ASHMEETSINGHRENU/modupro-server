import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  brand: { type: String, required: true },
  category: { type: String, required: true },
  categoryLabel: { type: String, required: true },
  image: { type: String, required: true },
  summary: { type: String, required: true },
  specifications: { type: Map, of: String },
  applications: { type: String, required: true }
}, {
  timestamps: true
});

export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
