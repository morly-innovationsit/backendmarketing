const Login = require('../model/loginModal');
const jwt = require('jsonwebtoken');

const loginController = {
  // Login user
  login: async (req, res) => {
    try {
      const { username, password } = req.body;
      
      // Debug logging
      console.log('=== DEBUG INFO ===');
      console.log('Request body:', req.body);
      console.log('Username:', username);
      console.log('Username type:', typeof username);
      console.log('Username length:', username?.length);
      console.log('Password provided:', !!password);
      console.log('Collection name:', Login.collection.name);
      
      // Validate input
      if (!username || !password) {
        return res.status(400).json({ 
          success: false, 
          message: 'Username and password are required' 
        });
      }

      // Trim whitespace
      const trimmedUsername = username.trim();
      const trimmedPassword = password.trim();

      // Check database stats
      const count = await Login.countDocuments();
      console.log('Total documents in collection:', count);
      
      // Get sample usernames (for debugging)
      const allUsers = await Login.find().limit(5).select('username');
      console.log('Sample usernames in DB:', allUsers.map(u => `"${u.username}"`));

      // Try case-insensitive search
      const login = await Login.findOne({ 
        username: { $regex: new RegExp(`^${trimmedUsername}$`, 'i') } 
      });
      
      console.log('Found login:', login ? 'YES' : 'NO');
      console.log('Login details:', login);
      console.log('=== END DEBUG ===');

      if (!login) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid credentials, username not found' 
        });
      }

      // Check password directly (plain text comparison)
      if (trimmedPassword !== login.password) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid credentials, password incorrect' 
        });
      }

      // Optional: Generate JWT token
      // const token = jwt.sign(
      //   { id: login._id, username: login.username },
      //   process.env.JWT_SECRET || 'your-secret-key',
      //   { expiresIn: '24h' }
      // );

      res.status(200).json({ 
        success: true, 
        message: 'Login successful',
        // token: token, // Uncomment if using JWT
        data: { 
          id: login._id,
          username: login.username,
          user_id: login.user_id
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error', 
        error: error.message 
      });
    }
  },

  // Helper function to check database connection
  checkConnection: async (req, res) => {
    try {
      const count = await Login.countDocuments();
      const sample = await Login.find().limit(3);
      
      res.status(200).json({
        success: true,
        connected: true,
        totalUsers: count,
        sampleUsers: sample.map(u => ({ 
          username: u.username, 
          user_id: u.user_id 
        }))
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        connected: false,
        error: error.message
      });
    }
  }
};

module.exports = loginController;