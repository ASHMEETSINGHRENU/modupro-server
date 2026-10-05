import mongoose from 'mongoose';

const industrySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true, trim: true },
    solutionsOffered: [{ type: String, trim: true }],
    commonApplications: [{ type: String, trim: true }],
    applicableProducts: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

export const Industry = mongoose.model('Industry', industrySchema);
