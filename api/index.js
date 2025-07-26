const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")

const app = express()

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://fix-us-app.vercel.app",
      "https://fix-us-app-git-main.vercel.app",
      "https://fix-us-app-git-develop.vercel.app",
      process.env.FRONTEND_URL,
    ].filter(Boolean),
    credentials: true,
  })
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/fixus", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err))

// Import routes
const conversationsRouter = require("../server/routes/conversations")

// Routes
app.use("/conversations", conversationsRouter)

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Fix Us API is running!",
    timestamp: new Date().toISOString(),
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
  })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  })
})

// Export for Vercel
module.exports = app
