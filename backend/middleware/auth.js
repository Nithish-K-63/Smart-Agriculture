import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'smart_agri_secure_secret_key_123!';

// Middleware to authenticate JWT access token
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  // Token format: "Bearer <token>"
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ status: 'error', message: 'Access denied: Token missing' });
  }

  jwt.verify(token, JWT_SECRET, (err, decodedUser) => {
    if (err) {
      return res.status(403).json({ status: 'error', message: 'Access forbidden: Token invalid or expired' });
    }
    
    // Append user metadata to request object
    req.user = decodedUser;
    next();
  });
};

// Middleware to enforce role restrictions (RBAC)
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        status: 'error', 
        message: `Forbidden: Access restricted to roles: [${roles.join(', ')}]` 
      });
    }
    next();
  };
};
