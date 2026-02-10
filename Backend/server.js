const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
// const connectDB = require('./config/db')

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect('mongodb://127.0.0.1:27017/minifuel', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));


// Schemas and Models
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



// Routes

// Haversine formula for distance calculation
const haversine = (lat1, lon1, lat2, lon2) => {
  const toRadians = (degree) => (degree * Math.PI) / 180;
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
};



// Find Nearest Bunk

// User Registration
app.post('/register', async (req, res) => {
  try {
    const { email, password, name1, mobile1, city1, address1, locality1 } = req.body;

    // Check if email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      email,
      password: hashedPassword,
      name1,
      mobile1,
      city1,
      address1,
      locality1,
    });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// User Login
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not registered' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, 'your_jwt_secret', { expiresIn: '1h' });
    res.json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Fetch User Details
app.get('/user', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const decoded = jwt.verify(token, 'your_jwt_secret');
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});


// Get User Profile
app.get('/user/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const decoded = jwt.verify(token, 'your_jwt_secret');
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});


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

const createbunkSchema = new mongoose.Schema({
  bunkName: { type: String, required: true },
  area: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  pincode: { type: String, required: true },
  landmark: { type: String, required: false },
  latitude: { type: Number, required: true }, // Ensure latitude is stored as a Number
  longitude: { type: Number, required: true }, // Ensure longitude is stored as a Number
  mobile: { type: String, required: true },
  fuelType: { type: String, required: true }, // Single fuel type as a string
});

const CreateBunk = mongoose.model('CreateBunk', createbunkSchema);

// Create Bunk
app.post('/createBunk/create', async (req, res) => {
  try {
    const {
      bunkName,
      area,
      address,
      city,
      pincode,
      landmark,
      latitude,
      longitude,
      mobile,
      fuelType,
    } = req.body;

    if (!bunkName || !area || !address || !city || !pincode || !latitude || !longitude || !mobile || !fuelType) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newBunk = new CreateBunk({
      bunkName,
      area,
      address,
      city,
      pincode,
      landmark,
      latitude,
      longitude,
      mobile,
      fuelType,
    });

    await newBunk.save();
    res.status(201).json({ message: 'Bunk created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/createBunk/nearest', async (req, res) => {
  try {
    const { fuelType, latitude, longitude } = req.body;

    if (!latitude || !longitude || !fuelType) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const bunks = await CreateBunk.find({ fuelType });
    if (!bunks.length) {
      return res.status(404).json({ message: 'No bunks found for the specified fuel type' });
    }

    let nearestBunk = null;
    let shortestDistance = Infinity;

    bunks.forEach((bunk) => {
      const distance = haversine(latitude, longitude, bunk.latitude, bunk.longitude);
      if (distance < shortestDistance) {
        shortestDistance = distance;
        nearestBunk = bunk;
      }
    });

    if (!nearestBunk) {
      return res.status(404).json({ message: 'No nearby bunk found' });
    }

    res.status(200).json({ ...nearestBunk.toObject(), distance: shortestDistance });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
// List All Bunks
app.get('/createBunk/list', async (req, res) => {
  try {
    const bunks = await CreateBunk.find();
    res.status(200).json(bunks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Find Nearest Bunk
// Find Nearest Bunk

app.get('/createbunk/details', async (req, res) => {
  try {
    // Check for the user's bunk by email
    const bunk = await Bunk.findOne({ email: req.body.email });

    if (bunk) {
      res.json(bunk); // If bunk exists, return bunk details
    } else {
      res.status(404).json({ message: 'No bunk found for this email' }); // Return message if no bunk found
    }
  } catch (error) {
    console.error('Error fetching bunk details:', error);
    res.status(500).json({ message: 'Error fetching bunk details' });
  }
});

// Endpoint to create a new bunk
// app.post('/createbunk/create', async (req, res) => {
//   try {
//     // Check if bunk already exists for the user's email
//     const existingBunk = await Bunk.findOne({ email: req.body.email });

//     if (existingBunk) {
//       return res.status(400).json({ message: 'Bunk already exists for this email' });
//     }

//     // If no existing bunk, create a new one
//     const newBunk = new Bunk(req.body);
//     await newBunk.save();

//     res.status(201).json({ message: 'Bunk created successfully', bunk: newBunk });
//   } catch (error) {
//     console.error('Error creating bunk:', error);
//     res.status(500).json({ message: 'Error creating bunk' });
//   }
// });

// Endpoint to update an existing bunk
app.post('/createbunk/update', async (req, res) => {
  try {
    const { email, bunkName, area, address, city, pincode, landmark, mobile, fuelType, latitude, longitude } = req.body;

    // Find the bunk by email
    const existingBunk = await Bunk.findOne({ email });

    if (!existingBunk) {
      return res.status(404).json({ message: 'No bunk found to update' });
    }

    // Update the bunk details
    existingBunk.bunkName = bunkName;
    existingBunk.area = area;
    existingBunk.address = address;
    existingBunk.city = city;
    existingBunk.pincode = pincode;
    existingBunk.landmark = landmark;
    existingBunk.mobile = mobile;
    existingBunk.fuelType = fuelType;
    existingBunk.latitude = latitude;
    existingBunk.longitude = longitude;

    await existingBunk.save();

    res.status(200).json({ message: 'Bunk updated successfully', bunk: existingBunk });
  } catch (error) {
    console.error('Error updating bunk:', error);
    res.status(500).json({ message: 'Error updating bunk' });
  }
});



// const orderSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   address: { type: String, required: true },
//   fuelType: { type: String, required: true },
//   quantity: { type: Number, required: true },
//   latitude: { type: String, required: true },
//   longitude: { type: String, required: true },
//   bunkName: { type: String, default: 'N/A' },
//   area: { type: String, default: 'N/A' },
//   distance: { type: Number, default: 0 },
//   // paidAmount: { type: Number, default: 0 },
//   // bookingDate: { type: Date, default: Date.now },
//   // bookingTime: { type: String, default: new Date().toLocaleTimeString() },
//   mobile: { type: String, default: 'N/A' },
//   email: { type: String, default: 'N/A' },
// });

// const Order = mongoose.model('Order', orderSchema);
const orderSchema = new mongoose.Schema({
  name: {type:String, required:true},
  address: {type:String, required:true},
  fuelType: {type:String, required:true},
  quantity: {type:Number, required:true},
  latitude: {type:Number, required:true},
  longitude: {type:Number, required:true},
});

const Order = mongoose.model('Order', orderSchema);

// module.exports = Order;

app.post('/api/orders', async (req, res) => {
  const { name, address, fuelType, quantity, latitude, longitude } = req.body;
  const order = new Order({ name, address, fuelType, quantity, latitude, longitude });
  
  try {
    await order.save();
    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (error) {
    res.status(500).json({ message: 'Error placing order', error: error.message });
  }
});

// Fetch all orders
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find(); // Fetch all orders
    res.status(200).json(orders); // Return the orders as a JSON response
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// app.post('/api/orders', (req, res) => {
//   const order = { id: orders.length + 1, ...req.body, bookingDate: new Date().toISOString().split('T')[0] };
//   orders.push(order);
//   res.status(201).send(order);
// });

// const orders = [];


app.get('/api/orders/latest', async (req, res) => {
  try {
    const latestOrder = await Order.findOne().sort({ _id: -1 }); // Sort by ID to get the latest order
    if (!latestOrder) {
      return res.status(404).send({ message: 'No orders found.' });
    }
    res.send(latestOrder);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});



// Start Server
app.listen(5000, () => console.log('Server running on port 5000'));     