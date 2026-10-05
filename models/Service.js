import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
  {
    serviceNumber: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    shortDescription: { type: String, required: true, trim: true },
    fullDescription: { type: String, trim: true },
    handledComponents: [{ type: String, enum: ['Mechanical', 'Electrical', 'Computerized'] }],
    scope: [{ type: String, trim: true }],
    applicableMachinery: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

export const Service = mongoose.model('Service', serviceSchema);
