import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import roleRoutes from "./routes/roleRoutes.js";
import logisticsRoutes from "./routes/logisticsRoutes.js";
import accessRoutes from "./routes/accessRoutes.js";
import returnRoutes from "./routes/returnRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cookieParser());

// const whitelist = [
//   "http://localhost:5173",
//   "https://algomian-web-app.vercel.app",
//   "https://algomian-tech.vercel.app",
//   "https://www.algomian.com",
//   "https://algomian.com",
// ];
// app.use(
//   cors({
//     origin: whitelist,
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );

const allowlist = [
  "http://localhost:5173",
  "https://algomian-web-app.vercel.app",
  "https://algomian-tech.vercel.app",
  "https://www.algomian.com",
  "https://algomian.com",
];

const corsOptions = {
  origin: (origin, cb) => {
    // - no Origin header when you call the API from Postman or a cron job
    if (!origin) return cb(null, true);

    if (allowlist.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: ${origin} not allowed`));
  },
  credentials: true, // ← lets cookies through
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
// app.options("/*", cors(corsOptions));

app.use("/api/users", userRoutes);

app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/logistics", logisticsRoutes);
app.use("/api/access", accessRoutes);
app.use("/api/returns", returnRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
