const jwt = require('jsonwebtoken');
const fs = require('fs');
const User = require('../models/user');

const publicKey = fs.readFileSync('./config/id_rsa_pub.pem');

module.exports = async function(req, res, next) {
  const jsonWebToken = req.headers['authorization'];
  // Check if authorization headers exist in request
  if (!jsonWebToken) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized'
    });
  }
  // Verify jsonwebtoken
  jwt.verify(jsonWebToken, publicKey, async function(err, decoded) {
    if (err) {
      return res.status(505).json({
        success: false,
        message: 'Error processing the request'
      });
    }
    // Check if user exist
    const user = await User.findOne({ _id: decoded.id });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    } else {
      res.locals.user = user;
      next();
    }
  });
}