const express = require("express")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { Pool } = require("pg")
const cors = require("cors")
const path = require("path")

const app = express()
const PORT = process.env.PORT || 3000

// Database connection
const pool = new Pool({
  user: "your_username",
  host: "localhost",
  database: "calorie_tracker",
  password: "your_password",
  port: 5432,
})

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, "../frontend")))

// JWT Secret
const JWT_SECRET = "your_jwt_secret_key"

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.sendStatus(401)
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403)
    req.user = user
    next()
  })
}

// Routes

// Register
app.post("/api/register", async (req, res) => {
  try {
    const { email, password } = req.body
    const hashedPassword = await bcrypt.hash(password, 10)

    const result = await pool.query("INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email", [
      email,
      hashedPassword,
    ])

    const token = jwt.sign({ userId: result.rows[0].id }, JWT_SECRET)
    res.json({ token, user: result.rows[0] })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Login
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email])
    const user = result.rows[0]

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET)
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Update user profile
app.put("/api/profile", authenticateToken, async (req, res) => {
  try {
    const { name, age, gender, height, weight } = req.body

    const result = await pool.query(
      "UPDATE users SET name = $1, age = $2, gender = $3, height = $4, weight = $5 WHERE id = $6 RETURNING *",
      [name, age, gender, height, weight, req.user.userId],
    )

    res.json(result.rows[0])
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Get user profile
app.get("/api/profile", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [req.user.userId])
    res.json(result.rows[0])
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Get food categories
app.get("/api/categories", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM food_categories WHERE is_default = TRUE OR user_id = $1", [
      req.user.userId,
    ])
    res.json(result.rows)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Add food category
app.post("/api/categories", authenticateToken, async (req, res) => {
  try {
    const { name } = req.body

    const result = await pool.query("INSERT INTO food_categories (user_id, name) VALUES ($1, $2) RETURNING *", [
      req.user.userId,
      name,
    ])

    res.json(result.rows[0])
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Search foods
app.get("/api/foods/search", authenticateToken, async (req, res) => {
  try {
    const { q } = req.query
    const result = await pool.query("SELECT * FROM foods WHERE name ILIKE $1 LIMIT 10", [`%${q}%`])
    res.json(result.rows)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Add food entry
app.post("/api/food-entries", authenticateToken, async (req, res) => {
  try {
    const { food_id, category_id, quantity, date } = req.body

    const result = await pool.query(
      "INSERT INTO food_entries (user_id, food_id, category_id, quantity, date) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [req.user.userId, food_id, category_id, quantity, date || new Date().toISOString().split("T")[0]],
    )

    res.json(result.rows[0])
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Get food entries for a date
app.get("/api/food-entries", authenticateToken, async (req, res) => {
  try {
    const { date } = req.query
    const targetDate = date || new Date().toISOString().split("T")[0]

    const result = await pool.query(
      `
            SELECT fe.*, f.name as food_name, f.calories_per_100g, f.protein_per_100g, 
                   f.carbs_per_100g, f.fat_per_100g, fc.name as category_name
            FROM food_entries fe
            JOIN foods f ON fe.food_id = f.id
            JOIN food_categories fc ON fe.category_id = fc.id
            WHERE fe.user_id = $1 AND fe.date = $2
            ORDER BY fe.created_at DESC
        `,
      [req.user.userId, targetDate],
    )

    res.json(result.rows)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
