import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    brand: {
      type: String,
      enum: ['MODUPRO', 'ADHHESI PRO', 'LOCKPRO'],
      default: 'MODUPRO',
    },
    categoryName: { type: String, required: true },
    categorySlug: {
      type: String,
      required: true,
      enum: [
        'adhhesi-pro',
        'woodworking-tools',
        'panel-processing-machines',
        'pvc-edge-banding-hardware',
        'machine-spares-services',
        'adhesives',
        'machinery',
        'machine-spares',
        'edge-banding-hardware',
      ],
    },
    shortDescription: { type: String, required: true, trim: true },
    fullDescription: { type: String, trim: true },
    image: { type: String, default: '' },
    mockupImage: { type: String, default: '' },
    badge: { type: String, default: '' },
    applications: [{ type: String, trim: true }],
    features: [{ type: String, trim: true }],
    isFeatured: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Product = mongoose.model('Product', productSchema);
