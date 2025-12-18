import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from './config/db.js';
import routeController from './routes/route.js';

const app = express();
const PORT = 5000;

// 1. Middleware
app.use(cors());
app.use(express.json());

// 2. Algorithm Route
app.use('/api/route', routeController);

// 3. Health Check
app.get('/', (req, res) => {
  res.send('Route Optimizer API is running...');
});

// 4. SIGNUP ROUTE (Raw SQL)
app.post('/api/signup', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
    await db.query(query, [name, email, hashedPassword]);
    res.status(201).json({ message: "User registered successfully!" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Email already exists or Database error" });
  }
});

// 5. LOGIN ROUTE (Raw SQL)
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];

    if (user && await bcrypt.compare(password, user.password)) {
      // Adding a JWT token so the frontend can "remember" the user
      const token = jwt.sign({ id: user.id }, 'your_secret_key', { expiresIn: '1h' });
      res.json({ 
        message: "Login successful", 
        token, 
        user: { id: user.id, name: user.name, email: user.email } 
      });
    } else {
      res.status(401).json({ error: "Invalid email or password" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});
// SAVE ROUTE HISTORY
app.post('/api/save-history', async (req, res) => {
  try {
    console.log("🔥 /api/save-history HIT");
    console.log("BODY =", req.body);

    const { userId, source, destination, totalCost, mode, path } = req.body;

    // 🔒 Validation
    if (!userId || !source || !destination || !totalCost || !path) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const sql = `
      INSERT INTO route_history 
      (user_id, source, destination, total_cost, mode, path)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.execute(sql, [
      userId,
      source,
      destination,
      totalCost,
      mode || 'driving',
      Array.isArray(path) ? path.join(' → ') : path
    ]);

    console.log("✅ INSERT RESULT:", result);

    res.json({
      message: "Route saved successfully",
      insertId: result.insertId
    });

  } catch (err) {
    console.error("❌ SAVE HISTORY ERROR:", err);
    res.status(500).json({ error: "Failed to save route history" });
  }
});

// FETCH ALL HISTORY FOR A USER
app.get('/api/history/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM route_history WHERE user_id = ? ORDER BY id DESC', [userId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch history" });
  }
});
// 6. Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});