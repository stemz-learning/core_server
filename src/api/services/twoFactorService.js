const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

// Generate a TOTP secret
function generateSecret(email, issuer = 'STEMz') {
  return speakeasy.generateSecret({ name: `${issuer}:${email}`, length: 32 });
}

// Produce a Data URL QR code for the otpauth URL
async function getQRCodeDataURL(otpauthUrl) {
  return qrcode.toDataURL(otpauthUrl);
}

// Verify a provided TOTP token against a stored base32 secret
function verifyToken(secret, token) {
  if (!secret) return false;
  return speakeasy.totp.verify({ secret, encoding: 'base32', token, window: 1 });
}

// Generate backup codes (hashed for storage, return plaintext for user once)
async function generateBackupCodes(count = 8) {
  const codes = [];
  for (let i = 0; i < count; i += 1) {
    const raw = crypto.randomBytes(5).toString('hex'); // 10 hex chars
    const hashed = await bcrypt.hash(raw, 6); // low cost for speed
    codes.push(raw); // Return raw codes to user; optionally store hashed version later
  }
  return codes;
}

module.exports = {
  generateSecret,
  getQRCodeDataURL,
  verifyToken,
  generateBackupCodes,
};
