import express from "express";
import cors from "cors";
import dotenv from "dotenv";
// import cookieParser from "cookie-parser"; //
import connect from "./db/db.js";

import userRoutes from "./routes/user.routes.js";
import authRoutes from "./routes/auth.routes.js";
import organizationRoutes from "./routes/organization.routes.js";
import studentRoutes from "./routes/student.routes.js";
import entryRoutes from "./routes/entry.routes.js";
import feedbackRoutes from "./routes/feedback.routes.js";

import passport from "./config/passport.js"

dotenv.config();

connect();
const app = express();

// Simplified, Express 5–safe CORS setup
app.use(
  cors({
    origin: ["https://hackathon-just-scan.vercel.app", "http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

//       Proper preflight handling for Express 5
// app.options(/.*/, cors());

app.use(passport.initialize());   // check

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("hello");
});

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/entries", entryRoutes);
app.use("/api/feedback", feedbackRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
});
