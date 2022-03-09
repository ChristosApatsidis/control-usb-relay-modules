const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const fs = require('fs');
const User = require("../models/user");
const user = require('../models/user');

const privateKey = fs.readFileSync('./config/id_rsa_priv.pem');

module.exports.EnableLogin = async function(req, res){
  const users = await User.find({ });

  if (users.length === 0) {
    return res.status(200).json({ enable: false });
  } 

  return res.status(200).json({ enable: true });
}


module.exports.Login = async (req, res) => {
  const { username, password } = req.body;

  // Check if request body has all json fields are required
  if (!username || !password) {
    return res.status(401).json({
      success: false,
      message: 'username and password is required'
    });
  }

  // Check if user with username exist
  const user = await User.findOne({ username }).catch((err) => {
    return res.status(505).json({
      success: false,
      message: 'Error processing the request'
    });
  });

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'User not exist' 
    });
  }

  // Check password
  const hashPassword = user.password;
  const checkPassword = bcrypt.compareSync(password, hashPassword);
  if (!checkPassword) {
    return res.status(401).json({
      success: false,
      message: "Incorrect password"
    });
  }

  // Sign jwt token
  const jsonWebToken = jwt.sign({ id: user._id }, privateKey, { algorithm: 'RS256'});

  // Update lastSignin date
  user.lastSignin = Date.now();
  await user.save();

  // return
  return res.status(200).json({
    success: true,
    token: jsonWebToken,
    user: {
      username: user.username,
      firstname: user.firstname,
      lastname: user.lastname
    }
  });
}


module.exports.Register = async (req, res) => {
  const { username, firstname, lastname, password } = req.body;

  // Check if request body has all json fields are required
  if (!username || !firstname || !lastname || !password) {
    return res.status(401).json({
      success: false,
      message: 'username, firstnme, lstname, password is required'
    });
  }

  // Check if user with same username already exist
  const user = await User.findOne({ username }).catch((err) => {
    return res.status(505).json({
      success: false,
      message: 'Error processing the request'
    });
  });

  if (user) {
    return res.status(401).json({
      success: false,
      message: 'User exist'
    });
  }

  // Hashing the password
  const hashPassword = bcrypt.hashSync(password, 10);

  // Create new user and save it
  const newUser = new User({username, firstname, lastname, password: hashPassword});

  try {
    await newUser.save();
  } catch(err) {
    return res.status(505).json({
      success: false,
      message: 'Error processing the request' 
    });
  }

  // Sign jwt token
  const jsonWebToken = jwt.sign({ id: newUser.id }, privateKey, { algorithm: 'RS256'});

  // return
  return res.status(200).json({
    success: true,
    token: jsonWebToken,
    user: {
      username: newUser.username,
      firstname: newUser.firstname,
      lastname: newUser.lastname
    }
  });
}


module.exports.User = async function(req, res){
  const user = res.locals.user;

  return res.status(200).json({
    success: true,
    user: {
      username: user.username,
      firstname: user.firstname,
      lastname: user.lastname
    }
  });
}


module.exports.EditUser = async function(req, res){
  const user = res.locals.user;
  const { username, firstname, lastname } = req.body;

  // Check if request body has all json fields are required
  if (!username || !firstname || !lastname) {
    return res.status(401).json({
      success: false,
      message: 'username, firstnme and lstname is required'
    });
  }

  // Check if user with same username already exist
  const userDb = await User.findOne({ _id: user._id }).catch((err) => {
    return res.status(505).json({
      success: false,
      message: 'Error processing the request'
    });
  });

  if (userDb._id.str !== user._id.str ) {
    return res.status(401).json({
      success: false,
      message: 'User with same username already exist'
    });
  }

  // Update username, firstname and lastname
  userDb.username = username;
  userDb.firstname = firstname;
  userDb.lastname = lastname;
  await userDb.save();

  return res.status(200).json({
    success: true,
    user: {
      username: userDb.username,
      firstname: userDb.firstname,
      lastname: userDb.lastname
    }
  });
}


module.exports.ChangePassword = async function(req, res){
  const user = res.locals.user;
  const { currentPassword, newPassword } = req.body;

  // Check if request body has all json fields are required
  if (!currentPassword || !newPassword) {
    return res.status(401).json({
      success: false,
      message: 'Current password and new password is required'
    });
  }

  // Get user
  const userDb = await User.findOne({ _id: user._id }).catch((err) => {
    return res.status(505).json({
      success: false,
      message: 'Error processing the request'
    });
  });

  // Check password
  const currentHashPassword = userDb.password;
  const checkPassword = bcrypt.compareSync(currentPassword, currentHashPassword);
  if (!checkPassword) {
    return res.status(401).json({
      success: false,
      message: "Incorrect password"
    });
  }

   // Hashing the password
   const hashPassword = bcrypt.hashSync(newPassword, 10);

  // Update password
  userDb.password = hashPassword;
  await userDb.save();

  return res.status(200).json({
    success: true,
    user: {
      username: userDb.username,
      firstname: userDb.firstname,
      lastname: userDb.lastname
    }
  });
}

