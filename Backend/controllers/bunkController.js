const Bunk = require('../models/bunkModel');

// Create a new bunk
exports.createBunk = async (req, res) => {
    const { email, ...bunkData } = req.body;
    try {
      const existingBunk = await Bunk.findOne({ email });
      if (existingBunk) return res.status(400).json({ message: 'Bunk already exists' });
      const newBunk = new Bunk({ email, ...bunkData });
      await newBunk.save();
      res.status(201).json({ message: 'Bunk created successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  };

// Update an existing bunk
exports.updateBunk = async (req, res) => {
    const { email, fuelType, fuelQuantity, ...updates } = req.body;
    try {
      const bunk = await Bunk.findOne({ email });
      if (!bunk) return res.status(404).json({ message: 'No bunk found' });
      if (fuelType) bunk.fuelType = fuelType;
      if (fuelQuantity) bunk.fuelQuantity = fuelQuantity;
      Object.assign(bunk, updates);
      await bunk.save();
      res.json({ message: 'Bunk updated successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  };
