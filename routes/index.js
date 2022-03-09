const path = require('path');
const express = require('express');
const router = express.Router();

// Middlewares
const protected = require('../middlewares/protectedRoute');

// Controllers
const relays = require('../controllers/relaysOnOff');
const auth = require('../controllers/auth');

// Frontend
router.get('*', (req, res) => {
  res.sendFile(path.resolve(process.cwd(), 'build/index.html'));
});

// Auth routes
router.post('/auth/ennablelogin', auth.EnableLogin);
router.post('/auth/login', auth.Login);
router.post('/auth/register', auth.Register);
router.post('/auth/user', protected, auth.User);
router.post('/auth/user/edit', protected, auth.EditUser);
router.post('/auth/user/changepassword', protected, auth.ChangePassword);

// Relays routes
router.post('/relays', protected, relays.Relays);
router.post('/relays/new', protected, relays.RelayNew);
router.post('/relays/open', protected, relays.RelayOpen);
router.post('/relays/update', protected, relays.RelayUpdate);
router.post('/relays/delete', protected, relays.RelayDelete);
router.post('/relays/connected', protected, relays.ConnectedRelays);
router.post('/relays/sync', protected, relays.SyncPath);
router.post('/relays/sync/all', protected, relays.SyncPathAll);

module.exports = router;