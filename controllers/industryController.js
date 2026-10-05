import { Industry } from '../models/Industry.js';
import { industriesData } from '../seed/seedData.js';

export const getIndustries = async (req, res) => {
  try {
    let industries = [];
    try {
      industries = await Industry.find().sort({ createdAt: 1 });
    } catch {
      industries = industriesData;
    }

    if (!industries.length) {
      industries = industriesData;
    }

    res.json({ success: true, count: industries.length, data: industries });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getIndustryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    let industry = null;

    try {
      industry = await Industry.findOne({ slug });
    } catch {
      industry = industriesData.find((i) => i.slug === slug);
    }

    if (!industry) {
      industry = industriesData.find((i) => i.slug === slug);
    }

    if (!industry) {
      return res.status(404).json({ success: false, message: 'Industry not found' });
    }

    res.json({ success: true, data: industry });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
