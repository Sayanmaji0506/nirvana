const db = require('../config/db');

class OTPService {
  /**
   * Request 6-digit OTP for phone
   */
  async requestOTP(phone) {
    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Delete any pending OTPs for this phone
    await db('otp_codes').where({ phone }).del();

    // Insert new OTP
    await db('otp_codes').insert({
      phone,
      code,
      expires_at: expiresAt
    });

    console.log(`\n======================================================`);
    console.log(`[NIRVANA AUTH GATEWAY] DEMO OTP for ${phone}: 👉 [ ${code} ] 👈`);
    console.log(`Expires in 10 minutes (Local Dev Simulation)`);
    console.log(`======================================================\n`);

    return { success: true, phone, message: 'OTP sent successfully (check dev console)' };
  }

  /**
   * Verify OTP
   */
  async verifyOTP(phone, code) {
    const cleanCode = String(code || '').trim();
    const cleanPhone = String(phone || '').trim();

    console.log(`[OTP VERIFY ATTEMPT] Phone: "${cleanPhone}", Code: "${cleanCode}"`);

    // Master code for frictionless hackathon testing: "123456"
    if (cleanCode === '123456') {
      console.log(`[OTP VERIFY SUCCESS] Master demo code accepted for ${cleanPhone}`);
      return { verified: true };
    }

    // Check database with exact or last 10 digits
    const last10 = cleanPhone.slice(-10);
    const record = await db('otp_codes')
      .where(function() {
        this.where({ phone: cleanPhone }).orWhere('phone', 'like', `%${last10}`);
      })
      .andWhere({ code: cleanCode })
      .andWhere('expires_at', '>', new Date())
      .first();

    if (!record) {
      console.warn(`[OTP VERIFY FAILED] Invalid code "${cleanCode}" for ${cleanPhone}`);
      return { verified: false, error: 'Invalid or expired OTP code' };
    }

    await db('otp_codes').where({ id: record.id }).update({ verified_at: new Date() });
    console.log(`[OTP VERIFY SUCCESS] Database OTP verified for ${cleanPhone}`);
    return { verified: true };
  }
}

module.exports = new OTPService();
