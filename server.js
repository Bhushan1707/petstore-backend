require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

// Route imports
const authRoutes = require('./routes/authRoutes');
const petRoutes = require('./routes/petRoutes');
const adoptionRoutes = require('./routes/adoptionRoutes');
const galleryRoutes = require('./routes/galleryRoutes');

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors({
  origin: '*', // For production, replace with your frontend URL
  credentials: true
}));
app.use(express.json());

// Serve static uploaded assets
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/adoptions', adoptionRoutes);
app.use('/api/gallery', galleryRoutes);

// Swagger Documentation Route (Express v5 compatible)
const swaggerRouter = express.Router();
swaggerRouter.use('/', swaggerUi.serve);
swaggerRouter.get('/', swaggerUi.setup(swaggerSpec));
app.use('/api-docs', swaggerRouter);

// Unmatched route handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  res.status(500).json({ success: false, message: err.message, stack: process.env.NODE_ENV === 'production' ? null : err.stack });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
