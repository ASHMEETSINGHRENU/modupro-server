import { Quote } from '../models/Quote.js';

const inMemoryQuotes = [];

export const createQuote = async (req, res) => {
  try {
    const {
      name,
      companyName,
      email,
      phone,
      productCategory,
      productOrService,
      scaleOrQuantity,
      projectDetails,
      location,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required.' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Valid email is required.' });
    }
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email format.' });
    }
    if (!phone || !phone.trim() || phone.trim().length < 8) {
      return res.status(400).json({ success: false, message: 'Valid phone number is required.' });
    }
    if (!projectDetails || !projectDetails.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide details of your project requirement.' });
    }

    const payload = {
      name: name.trim(),
      companyName: companyName ? companyName.trim() : '',
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      productCategory: productCategory ? productCategory.trim() : 'General Requirement',
      productOrService: productOrService ? productOrService.trim() : '',
      scaleOrQuantity: scaleOrQuantity ? scaleOrQuantity.trim() : '',
      projectDetails: projectDetails.trim(),
      location: location ? location.trim() : '',
      createdAt: new Date(),
    };

    let saved = null;
    try {
      saved = await Quote.create(payload);
    } catch {
      payload._id = 'quote_mem_' + Date.now();
      inMemoryQuotes.push(payload);
      saved = payload;
    }

    res.status(201).json({
      success: true,
      message: 'Quotation request submitted successfully! A MODUPRO technical representative will connect with you.',
      data: saved,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Server error processing quote request.' });
  }
};

export const getQuotes = async (req, res) => {
  try {
    let quotes = [];
    try {
      quotes = await Quote.find().sort({ createdAt: -1 });
    } catch {
      quotes = inMemoryQuotes;
    }
    res.json({ success: true, count: quotes.length, data: quotes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
