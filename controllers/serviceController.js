import { Service } from '../models/Service.js';
import { servicesData } from '../seed/seedData.js';

export const getServices = async (req, res) => {
  try {
    let services = [];
    try {
      services = await Service.find().sort({ serviceNumber: 1 });
    } catch {
      services = servicesData;
    }

    if (!services.length) {
      services = servicesData;
    }

    res.json({ success: true, count: services.length, data: services });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getServiceBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    let service = null;

    try {
      service = await Service.findOne({ slug });
    } catch {
      service = servicesData.find((s) => s.slug === slug);
    }

    if (!service) {
      service = servicesData.find((s) => s.slug === slug);
    }

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    res.json({ success: true, data: service });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
