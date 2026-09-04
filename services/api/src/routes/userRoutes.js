const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticate } = require('../middleware/auth');

/**
 * GET /users/me
 */
router.get('/me', authenticate, async (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user
  });
});

/**
 * PATCH /users/me
 */
router.patch('/me', authenticate, async (req, res) => {
  const { name, kyc_type, license_number } = req.body;
  const updates = {};
  if (name) updates.name = name;
  if (kyc_type) updates.kyc_type = kyc_type;
  if (license_number) updates.license_number = license_number;

  try {
    const [updatedUser] = await db('users')
      .where({ id: req.user.id })
      .update(updates)
      .returning('*');

    return res.status(200).json({
      success: true,
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
});

module.exports = router;
