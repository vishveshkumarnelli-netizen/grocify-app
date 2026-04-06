const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile, updateUserProfile, addAddress, getAllUsers } = require('../controllers/userController');
const { protect, admin } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);
router.post('/address', protect, addAddress);
router.get('/', protect, admin, getAllUsers);

module.exports = router;
