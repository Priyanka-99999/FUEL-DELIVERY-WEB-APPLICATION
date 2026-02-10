const express = require('express');
const jwt = require('jsonwebtoken');
const Bunk = require('../models/bunkModel');

const router = express.Router();
const app = express();

// Middleware to authenticate user
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(403).json({ message: 'Access denied' });
  }

  try {
    const decoded = jwt.verify(token, 'secretKey');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// Bunk Registration
app.post('/bunk/register', async (req, res) => {
    try {
      const { email, password, name, mobile, city, address, locality } = req.body;
  
      const existingUser = await Bunk.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email is already registered' });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new Bunk({ email, password: hashedPassword, name, mobile, city, address, locality });
      await newUser.save();
  
      res.status(201).json({ message: 'Bunk registered successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  });
  
  // Bunk Login
  app.post('/bunk/login', async (req, res) => {
    try {
      const { email, password } = req.body;
  
      const user = await Bunk.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'Bunk not registered' });
      }
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
  
      res.json({ message: 'Login successful' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  });

// Get Bunk details (if it exists)
router.post('/details', authenticate, async (req, res) => {
  try {
    const bunk = await Bunk.findOne({ email: req.user.email });
    if (!bunk) {
      return res.status(404).json({ message: 'No bunk found' });
    }
    res.status(200).json(bunk);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bunk details' });
  }
});

// Create or update Bunk
router.post('/create', authenticate, async (req, res) => {
  const { bunkName, area, address, city, pincode, landmark, mobile, fuelType, fuelQuantity, latitude, longitude } = req.body;

  try {
    const existingBunk = await Bunk.findOne({ email: req.user.email });
    if (existingBunk) {
      return res.status(400).json({ message: 'You already have a bunk created' });
    }

    const newBunk = new Bunk({
      email: req.user.email,
      bunkName,
      area,
      address,
      city,
      pincode,
      landmark,
      mobile,
      fuelType,
      fuelQuantity,
      latitude,
      longitude,
    });

    await newBunk.save();
    res.status(201).json({ message: 'Bunk created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating bunk' });
  }
});

// Update Bunk
router.post('/update', authenticate, async (req, res) => {
  const { bunkName, area, address, city, pincode, landmark, mobile, fuelType, fuelQuantity, latitude, longitude } = req.body;

  try {
    const bunk = await Bunk.findOneAndUpdate(
      { email: req.user.email },
      { bunkName, area, address, city, pincode, landmark, mobile, fuelType, fuelQuantity, latitude, longitude },
      { new: true }
    );

    if (!bunk) {
      return res.status(404).json({ message: 'Bunk not found' });
    }

    res.status(200).json({ message: 'Bunk updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating bunk' });
  }
});

module.exports = router;
