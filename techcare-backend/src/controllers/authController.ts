import { Request, Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";

const isValidPhoneNumber = (phone: string): boolean => {
  const digits = phone.replace(/\D/g, "");
  return /^\+?[0-9().\-\s]+$/.test(phone) && digits.length >= 7 && digits.length <= 15;
};

const generateToken = (userId: string, role: string): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }

  return jwt.sign(
    {
      userId,
      role,
    },
    secret,
    {
      expiresIn: "7d",
    }
  );
};

export const register = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, email, phone, password } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !email.trim() ||
      typeof phone !== "string" ||
      !phone.trim() ||
      typeof password !== "string" ||
      !password
    ) {
      res.status(400).json({
        message: "Please provide name, email, phone and password.",
      });
      return;
    }

    const normalizedPhone = phone.trim();
    if (!isValidPhoneNumber(normalizedPhone)) {
      res.status(400).json({
        message: "Please enter a valid phone number with 7 to 15 digits.",
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        message: "Password must be at least 6 characters.",
      });
      return;
    }

    const existingUser = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (existingUser) {
      res.status(409).json({
        message: "An account with this email already exists.",
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email.trim().toLowerCase(),
      phone: normalizedPhone,
      password: hashedPassword,
      role: "CUSTOMER",
    });

    const token = generateToken(user._id.toString(), user.role);

    res.status(201).json({
      message: "Customer account created successfully.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Register error:", error);

    res.status(500).json({
      message: "Server error while creating account.",
    });
  }
};

export const createAgent = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { name, email, phone, password, specialization, isActive } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !email.trim() ||
      typeof phone !== "string" ||
      !phone.trim() ||
      typeof password !== "string" ||
      !password
    ) {
      res.status(400).json({
        message: "Please provide name, email, phone and an initial password.",
      });
      return;
    }

    if (!isValidPhoneNumber(phone.trim())) {
      res.status(400).json({
        message: "Please enter a valid phone number with 7 to 15 digits.",
      });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({
        message: "The agent password must be at least 8 characters.",
      });
      return;
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      res.status(409).json({
        message: "An account with this email already exists.",
      });
      return;
    }

    const agent = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      phone: String(phone).trim(),
      password: await bcrypt.hash(password, 10),
      role: "AGENT",
      isActive: isActive !== false,
      specialization: typeof specialization === "string"
        ? specialization.trim()
        : undefined,
    });

    res.status(201).json({
      message: "Agent account created successfully.",
      user: {
        id: agent._id,
        name: agent.name,
        email: agent.email,
        phone: agent.phone,
        role: agent.role,
        isActive: agent.isActive,
        specialization: agent.specialization,
      },
    });
  } catch (error) {
    console.error("Create agent error:", error);

    res.status(500).json({
      message: "Server error while creating agent account.",
    });
  }
};

export const createCustomer = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { name, email, phone, password, isActive } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !email.trim() ||
      typeof phone !== "string" ||
      !phone.trim() ||
      typeof password !== "string" ||
      !password
    ) {
      res.status(400).json({
        message: "Please provide name, email, phone and an initial password.",
      });
      return;
    }

    const normalizedPhone = phone.trim();
    if (!isValidPhoneNumber(normalizedPhone)) {
      res.status(400).json({
        message: "Please enter a valid phone number with 7 to 15 digits.",
      });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({
        message: "The customer password must be at least 8 characters.",
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      res.status(409).json({
        message: "An account with this email already exists.",
      });
      return;
    }

    const customer = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: normalizedPhone,
      password: await bcrypt.hash(password, 10),
      role: "CUSTOMER",
      isActive: isActive !== false,
      mustChangePassword: true,
    });

    res.status(201).json({
      message: "Customer account created successfully.",
      user: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        role: customer.role,
        isActive: customer.isActive,
      },
    });
  } catch (error) {
    console.error("Create customer error:", error);

    res.status(500).json({
      message: "Server error while creating customer account.",
    });
  }
};

export const getActiveAgents = async (
  _req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const agents = await User.find({
      role: "AGENT",
      isActive: true,
    })
      .select("name email specialization")
      .sort({ name: 1 });

    res.status(200).json({
      agents: agents.map((agent) => ({
        id: agent._id,
        name: agent.name,
        email: agent.email,
        specialization: agent.specialization,
      })),
    });
  } catch (error) {
    console.error("Get active agents error:", error);

    res.status(500).json({
      message: "Server error while getting agents.",
    });
  }
};

export const getManagedUsers = async (
  _req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const users = await User.find({
      role: { $in: ["AGENT", "CUSTOMER"] },
    })
      .select("name email phone role isActive createdAt")
      .sort({ createdAt: -1 });

    res.status(200).json({
      users: users.map((user) => ({
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      })),
    });
  } catch (error) {
    console.error("Get managed users error:", error);
    res.status(500).json({
      message: "Server error while getting accounts.",
    });
  }
};

export const updateUserRole = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { role } = req.body;
    if (role !== "AGENT" && role !== "CUSTOMER") {
      res.status(400).json({
        message: "Account role must be AGENT or CUSTOMER.",
      });
      return;
    }

    const userId = req.params.id;
    if (typeof userId !== "string" || !/^[a-f\d]{24}$/i.test(userId)) {
      res.status(400).json({ message: "Invalid account ID." });
      return;
    }

    const user = await User.findOne({
      _id: userId,
      role: { $in: ["AGENT", "CUSTOMER"] },
    });
    if (!user) {
      res.status(404).json({
        message: "Account not found or cannot be assigned a role.",
      });
      return;
    }

    user.role = role;
    if (role === "CUSTOMER") user.specialization = undefined;
    await user.save();

    res.status(200).json({
      message: `Account role updated to ${role === "AGENT" ? "agent" : "customer"}.`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Update user role error:", error);
    res.status(500).json({
      message: "Server error while updating the account role.",
    });
  }
};

export const login = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        message: "Please provide email and password.",
      });
      return;
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      res.status(401).json({
        message: "Invalid email or password.",
      });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({
        message: "This account has been deactivated.",
      });
      return;
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      res.status(401).json({
        message: "Invalid email or password.",
      });
      return;
    }

    const token = generateToken(
      user._id.toString(),
      user.role
    );

    res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: "Server error while logging in.",

    });
  }
};

export const changePassword = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (
      typeof currentPassword !== "string" ||
      !currentPassword ||
      typeof newPassword !== "string" ||
      !newPassword
    ) {
      res.status(400).json({
        message: "Please provide your current password and a new password.",
      });
      return;
    }

    if (newPassword.length < 8) {
      res.status(400).json({
        message: "Your new password must be at least 8 characters.",
      });
      return;
    }

    if (!req.user) {
      res.status(401).json({
        message: "Authentication required.",
      });
      return;
    }

    if (req.user.role !== "CUSTOMER" && req.user.role !== "AGENT") {
      res.status(403).json({
        message: "Only customers and agents can change their password here.",
      });
      return;
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({
        message: "User not found.",
      });
      return;
    }

    const currentPasswordMatches = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!currentPasswordMatches) {
      res.status(400).json({
        message: "Your current password is incorrect.",
      });
      return;
    }

    if (currentPassword === newPassword) {
      res.status(400).json({
        message: "Your new password must be different from your current password.",
      });
      return;
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.mustChangePassword = false;
    await user.save();

    res.status(200).json({
      message: "Your password has been changed successfully.",
    });
  } catch (error) {
    console.error("Change password error:", error);

    res.status(500).json({
      message: "Server error while changing your password.",
    });
  }
};

export const getMe = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        message: "Authentication required.",
      });
      return;
    }

    const user = await User.findById(req.user.id).select(
      "-password"
    );

    if (!user) {
      res.status(404).json({
        message: "User not found.",
      });
      return;
    }

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        specialization: user.specialization,
        isActive: user.isActive,
        mustChangePassword: user.mustChangePassword,
      },
    });
  } catch (error) {
    console.error("Get current user error:", error);

    res.status(500).json({
      message: "Server error.",
    });
  }
};

export const updateAgentSpecialization = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Authentication required." });
      return;
    }

    if (req.user.role !== "AGENT") {
      res.status(403).json({ message: "Only agents can update their specialization." });
      return;
    }

    const { specialization } = req.body;
    if (
      typeof specialization !== "string" ||
      !specialization.trim() ||
      specialization.trim().length > 100
    ) {
      res.status(400).json({
        message: "Choose a specialization of 1 to 100 characters.",
      });
      return;
    }

    const agent = await User.findOne({ _id: req.user.id, role: "AGENT" });
    if (!agent) {
      res.status(404).json({ message: "Agent account not found." });
      return;
    }

    agent.specialization = specialization.trim();
    await agent.save();

    res.status(200).json({
      message: "Your specialization has been updated.",
      specialization: agent.specialization,
    });
  } catch (error) {
    console.error("Update agent specialization error:", error);
    res.status(500).json({
      message: "Server error while updating your specialization.",
    });
  }
};