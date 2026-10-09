import dotenv from "dotenv";
import app from "./app";
import connectDatabase from "./config/database";

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async (): Promise<void> => {
  await connectDatabase();

  app.listen(PORT, () => {
    console.log(`TechCare backend running on port ${PORT}`);
  });
};

startServer();