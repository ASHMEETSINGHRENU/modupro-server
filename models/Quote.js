import mongoose from 'mongoose';

const quoteSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    companyName: { type: String, trim: true, default: '' },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      minlength: [8, 'Phone number must be at least 8 digits'],
    },
    productCategory: { type: String, trim: true, default: 'General Requirement' },
    productOrService: { type: String, trim: true, default: '' },
    scaleOrQuantity: { type: String, trim: true, default: '' },
    projectDetails: { type: String, required: [true, 'Project details are required'], trim: true },
    location: { type: String, trim: true, default: '' },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'quoted', 'declined'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

export const Quote = mongoose.model('Quote', quoteSchema);
