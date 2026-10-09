
import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../src/models/User";

dotenv.config();

const createAdmin = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error("MONGODB_URI is missing from your .env file.");
    }

    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB.");

    const existingAdmin = await User.findOne({ role: "ADMIN" });

    if (existingAdmin) {
      console.log("An Admin account already exists.");
      console.log(`Admin email: ${existingAdmin.email}`);
      return;
    }

    const name = process.env.ADMIN_NAME;
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const phone = process.env.ADMIN_PHONE;
    const password = process.env.ADMIN_PASSWORD;

    if (!name || !email || !phone || !password) {
      throw new Error(
        "Set ADMIN_NAME, ADMIN_EMAIL, ADMIN_PHONE, and ADMIN_PASSWORD in .env."
      );
    }

    if (password.length < 12) {
      throw new Error("Admin password must be at least 12 characters.");
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new Error(
        "This email already belongs to another account. Choose a different Admin email."
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const admin = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: "ADMIN",
      isActive: true,
    });

    console.log("Admin account created successfully.");
    console.log(`Admin email: ${admin.email}`);
  } catch (error) {
    console.error("Admin setup failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

void createAdmin();