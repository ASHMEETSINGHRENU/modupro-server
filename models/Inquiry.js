import mongoose from 'mongoose';

const inquirySchema = new mongoose.Schema({
  name: { type: String, required: true },
  company: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  location: { type: String, required: true },
  industry: { type: String, required: true },
  categories: [{ type: String }],
  details: { type: String },
  status: { type: String, enum: ['new', 'contacted', 'closed'], default: 'new' }
}, {
  timestamps: true
});

export const Inquiry = mongoose.models.Inquiry || mongoose.model('Inquiry', inquirySchema);
