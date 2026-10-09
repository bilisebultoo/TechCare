
import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../src/models/User";

dotenv.config();

async function updateAdmin(): Promise<void> {
  try {
    const uri = process.env.MONGODB_URI;
    const name = process.env.ADMIN_NAME;
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const phone = process.env.ADMIN_PHONE;
    const password = process.env.ADMIN_PASSWORD;

    if (!uri || !name || !email || !phone || !password) {
      throw new Error("Check the required settings in .env.");
    }

    if (password.length < 12) {
      throw new Error("Use a unique password with at least 12 characters.");
    }

    await mongoose.connect(uri);

    const admin = await User.findOne({ role: "ADMIN" });

    if (!admin) {
      throw new Error("No existing Admin account was found.");
    }

    const duplicate = await User.findOne({
      email,
      _id: { $ne: admin._id },
    });

    if (duplicate) {
      throw new Error("This email is already used by another account.");
    }

    admin.name = name;
    admin.email = email;
    admin.phone = phone;
    admin.password = await bcrypt.hash(password, 12);
    admin.isActive = true;

    await admin.save();

    console.log("Admin account updated successfully.");
    console.log("Admin email:", admin.email);
    console.log("Role:", admin.role);
  } catch (error) {
    console.error("Admin update failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

void updateAdmin();