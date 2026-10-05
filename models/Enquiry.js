import mongoose from 'mongoose';

const enquirySchema = new mongoose.Schema(
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
    productOrService: { type: String, trim: true, default: 'General Inquiry' },
    message: { type: String, required: [true, 'Message is required'], trim: true },
    preferredContactMethod: {
      type: String,
      enum: ['phone', 'email', 'whatsapp', 'any'],
      default: 'any',
    },
    status: {
      type: String,
      enum: ['new', 'in-progress', 'responded', 'closed'],
      default: 'new',
    },
  },
  { timestamps: true }
);

export const Enquiry = mongoose.model('Enquiry', enquirySchema);
