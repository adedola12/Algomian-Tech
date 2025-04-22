/* ---------------- core setup ---------------- */
import express from "express";
import cors    from "cors";
import dotenv  from "dotenv";
import connectDB from "./config/db.js";

/* ---------------- routes / middleware -------- */
import userRoutes               from "./routes/userRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

dotenv.config();
connectDB();

const app = express();

/* ──────────────────────────────────────────────
   body‑parser BEFORE routes
   ────────────────────────────────────────────── */
app.use(express.json());

/* ───────────── CORS ─────────────
   If you ever add another frontend just push its URL
   into this array.
*/
const whitelist = ["http://localhost:5173"];
app.use(
  cors({
    origin(origin, cb) {
      // Allow REST tools / mobile apps with no origin header
      if (!origin || whitelist.includes(origin)) return cb(null, true);
      cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

/* ───────────── Routes ───────────── */
app.use("/api/users", userRoutes);

/* ────────── 404 / Error handlers ────────── */
app.use(notFound);
app.use(errorHandler);

/* ───────────── Listen ───────────── */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
