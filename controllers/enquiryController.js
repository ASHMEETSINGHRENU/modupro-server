import { Enquiry } from '../models/Enquiry.js';

// In-memory buffer in case DB connection is momentarily disconnected
const inMemoryEnquiries = [];

export const createEnquiry = async (req, res) => {
  try {
    const { name, companyName, email, phone, productOrService, message, preferredContactMethod } = req.body;

    // Server-side validation
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Your name is required.' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'A valid email address is required.' });
    }
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email format.' });
    }
    if (!phone || !phone.trim() || phone.trim().length < 8) {
      return res.status(400).json({ success: false, message: 'A valid phone number (at least 8 digits) is required.' });
    }
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Please enter your message or project enquiry details.' });
    }

    const payload = {
      name: name.trim(),
      companyName: companyName ? companyName.trim() : '',
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      productOrService: productOrService ? productOrService.trim() : 'General Inquiry',
      message: message.trim(),
      preferredContactMethod: preferredContactMethod || 'any',
      createdAt: new Date(),
    };

    let saved = null;
    try {
      saved = await Enquiry.create(payload);
    } catch {
      // Offline / fallback storage
      payload._id = 'mem_' + Date.now();
      inMemoryEnquiries.push(payload);
      saved = payload;
    }

    res.status(201).json({
      success: true,
      message: 'Thank you! Your enquiry has been received. Our team will contact you shortly.',
      data: saved,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Server error processing enquiry.' });
  }
};

export const getEnquiries = async (req, res) => {
  try {
    let enquiries = [];
    try {
      enquiries = await Enquiry.find().sort({ createdAt: -1 });
    } catch {
      enquiries = inMemoryEnquiries;
    }
    res.json({ success: true, count: enquiries.length, data: enquiries });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
