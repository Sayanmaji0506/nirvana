const express = require('express');
const router = express.Router();
const db = require('../config/db');
const otpService = require('../services/otpService');
const { generateToken, authenticate } = require('../middleware/auth');

/**
 * POST /auth/otp/request
 * Send OTP to phone
 */
router.post('/otp/request', async (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ success: false, error: 'Phone number is required' });
  }

  try {
    const result = await otpService.requestOTP(phone);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error requesting OTP:', error);
    return res.status(500).json({ success: false, error: 'Failed to request OTP' });
  }
});

/**
 * POST /auth/otp/verify
 * Verify OTP, create or retrieve user, return JWT
 */
router.post('/otp/verify', async (req, res) => {
  const cleanPhone = String(req.body.phone || '').trim();
  const cleanCode = String(req.body.code || '').trim();
  const { name, role } = req.body;

  if (!cleanPhone || !cleanCode) {
    return res.status(400).json({ success: false, error: 'Phone and OTP code are required' });
  }

  try {
    const verification = await otpService.verifyOTP(cleanPhone, cleanCode);
    if (!verification.verified) {
      return res.status(400).json({ success: false, error: verification.error });
    }

    // Find or create user with exact or 10-digit phone match
    const last10 = cleanPhone.slice(-10);
    let user = await db('users')
      .where({ phone: cleanPhone })
      .orWhere('phone', 'like', `%${last10}`)
      .first();

    if (!user) {
      const newUserRole = (role === 'reporter' || role === 'official') ? role : 'driver';
      const [createdUser] = await db('users').insert({
        name: name || 'NER Transporter',
        phone: cleanPhone,
        role: newUserRole,
        kyc_status: 'unverified'
      }).returning('*');
      user = createdUser;
    }

    const token = generateToken(user.id, user.role);

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        kyc_status: user.kyc_status,
        kyc_type: user.kyc_type
      }
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return res.status(500).json({ success: false, error: 'Failed to verify OTP' });
  }
});

/**
 * POST /auth/kyc/verify
 * Mock KYC verification (license, aadhaar, digilocker)
 * NOTE (§8): Real DigiLocker requires approved Requesting Entity status.
 * Here we mock the verification and mark kyc_status = 'verified'.
 */
router.post('/kyc/verify', authenticate, async (req, res) => {
  const { kyc_type, license_number, document_id } = req.body;
  const user = req.user;

  try {
    // In production: Place DigiLocker OAuth redirect / UIDAI Aadhaar OTP verification here
    const updated = await db('users')
      .where({ id: user.id })
      .update({
        kyc_status: 'verified',
        kyc_type: kyc_type || 'license',
        license_number: license_number || document_id || 'AS-01-MOCK-VERIFIED'
      })
      .returning('*');

    return res.status(200).json({
      success: true,
      message: 'Identity and credentials verified successfully',
      user: updated[0]
    });
  } catch (error) {
    console.error('Error in KYC verification:', error);
    return res.status(500).json({ success: false, error: 'Failed to verify KYC' });
  }
});

module.exports = router;
