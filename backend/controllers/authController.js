import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Farmer from '../models/Farmer.js';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'smart_agri_secure_secret_key_123!';

// Register a new farmer user profile
export const registerFarmer = async (req, res) => {
  const { email, password, firstName, lastName, phoneNumber, language } = req.body;

  if (!email || !password || !firstName || !lastName || !phoneNumber) {
    return res.status(400).json({ status: 'error', message: 'All registration fields are required' });
  }

  try {
    // Check if email already exists
    const existingUser = User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ status: 'error', message: 'Email address already registered' });
    }

    // Check if phone number already exists
    const existingPhone = Farmer.findOne({ phone_number: phoneNumber });
    if (existingPhone) {
      return res.status(409).json({ status: 'error', message: 'Phone number already registered' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user record (Default role: Farmer)
    const savedUser = User.create({
      email,
      password_hash: passwordHash,
      role: 'Farmer'
    });

    // Create farmer profile details linked to the new user record
    Farmer.create({
      user_id: savedUser._id,
      first_name: firstName,
      last_name: lastName,
      phone_number: phoneNumber,
      preferred_language: language || 'EN'
    });

    res.status(201).json({ 
      status: 'success', 
      message: 'Farmer user account registered successfully',
      data: { userId: savedUser._id, email }
    });
  } catch (err) {
    console.error('Registration failed:', err);
    res.status(500).json({ status: 'error', message: 'Failed to complete farmer registration' });
  }
};

// Authenticate user and return JWT
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ status: 'error', message: 'Email and password are required' });
  }

  try {
    // Query user profile
    const user = User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ status: 'error', message: 'Invalid email address or password' });
    }

    // Verify password hash
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ status: 'error', message: 'Invalid email address or password' });
    }

    // Generate signed JWT
    const token = jwt.sign(
      { userId: user.user_id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      status: 'success',
      message: 'Authentication successful',
      data: {
        token: `Bearer ${token}`,
        role: user.role,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Login failed:', err);
    res.status(500).json({ status: 'error', message: 'Internal server login error' });
  }
};
