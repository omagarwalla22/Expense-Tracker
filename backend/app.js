import express from "express";
import cors from "cors";
import { connectDB } from "./DB/Database.js";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import transactionRoutes from "./Routers/Transactions.js";
import userRoutes from "./Routers/userRouter.js";
import path from "path";

// Load environment variables
dotenv.config({ path: "config.env" });

// Initialize app
const app = express();

// Get port from env or fallback
const PORT = process.env.PORT || 5001;

// Debug check: Make sure env variables are loaded
if (!process.env.MONGO_URL) {
  console.warn("⚠️ Warning: MONGO_URI is not defined in config.env");
}
if (!process.env.PORT) {
  console.warn("⚠️ Warning: PORT is not defined in config.env. Using fallback 5001.");
}

// Connect to DB
connectDB();

// CORS config
const allowedOrigins = [
 "http://localhost:3000"
  // add more as needed
];

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Routes
app.use("/api/v1", transactionRoutes);
app.use("/api/auth", userRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
