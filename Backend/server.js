const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection (Cloud)
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

/* =======================
   SCHEMAS & MODELS
======================= */

// User
const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  name1: { type: String, required: true },
  mobile1: { type: String, required: true },
  city1: { type: String, required: true },
  address1: { type: String, required: true },
  locality1: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

// Bunk
const bunkSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  mobile: { type: String, required: true },
  city: { type: String, required: true },
  address: { type: String, required: true },
  locality: { type: String, required: true },
});

const Bunk = mongoose.model('Bunk', bunkSchema);

// Create Bunk
const createbunkSchema = new mongoose.Schema({
  bunkName: { type: String, required: true },
  area: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  pincode: { type: String, required: true },
  landmark: String,
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  mobile: { type: String, required: true },
  fuelType: { type: String, required: true },
});

const CreateBunk = mongoose.model('CreateBunk', createbunkSchema);

// Orders
const orderSchema = new mongoose.Schema({
  name: String,
  address: String,
  fuelType: String,
  quantity: Number,
  latitude: Number,
  longitude: Number,
});

const Order = mongoose.model('Order', orderSchema);

/* =======================
   HELPER FUNCTIONS
======================= */

// Haversine Formula
const haversine = (lat1, lon1, lat2, lon2) => {
  const toRadians = (deg) => (deg * Math.PI) / 180;
  const R = 6371;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/* =======================
   ROUTES
======================= */

// Health Check
app.get('/', (req, res) => {
  res.send('Fuel Delivery Backend is Running ✅');
});

// User Register
app.post('/register', async (req, res) => {
  try {
    const { email, password, name1, mobile1, city1, address1, locality1 } = req.body;

    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({
      email,
      password: hashed,
      name1,
      mobile1,
      city1,
      address1,
      locality1,
    });

    await user.save();
    res.status(201).json({ message: 'Registered successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// User Login
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Not registered' });

    if (!(await bcrypt.compare(password, user.password)))
      return res.status(400).json({ message: 'Invalid password' });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'secret123',
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create Bunk
app.post('/createBunk/create', async (req, res) => {
  try {
    const bunk = new CreateBunk(req.body);
    await bunk.save();
    res.json({ message: 'Bunk created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Nearest Bunk
app.post('/createBunk/nearest', async (req, res) => {
  try {
    const { fuelType, latitude, longitude } = req.body;

    const bunks = await CreateBunk.find({ fuelType });

    let nearest = null;
    let min = Infinity;

    bunks.forEach((b) => {
      const d = haversine(latitude, longitude, b.latitude, b.longitude);
      if (d < min) {
        min = d;
        nearest = b;
      }
    });

    if (!nearest) return res.status(404).json({ message: 'No bunk found' });

    res.json({ ...nearest.toObject(), distance: min });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Orders
app.post('/api/orders', async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orders', async (req, res) => {
  const orders = await Order.find();
  res.json(orders);
});

app.get('/api/orders/latest', async (req, res) => {
  const latest = await Order.findOne().sort({ _id: -1 });
  res.json(latest);
});

/* =======================
   START SERVER
======================= */

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
