import express from 'express';
import cors from 'cors';
import routeController from './routes/route.js';

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/route', routeController);

// Basic Health Check
app.get('/', (req, res) => {
  res.send('Route Optimizer API is running...');
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});