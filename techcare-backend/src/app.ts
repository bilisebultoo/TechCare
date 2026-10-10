import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes";
import problemReportRoutes from "./routes/problemReportRoutes";
import ticketRoutes from "./routes/ticketRoutes";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({
    message: "TechCare API is running",
  });
});

app.use("/api/auth", authRoutes);

app.use(
  "/api/problem-reports",
  problemReportRoutes
);

app.use("/api/tickets", ticketRoutes);

export default app;                                                                                                         