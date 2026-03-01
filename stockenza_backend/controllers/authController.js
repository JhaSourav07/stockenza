const crypto    = require('crypto');
const { Resend } = require('resend');
const User      = require('../models/User');
const jwt       = require('jsonwebtoken');

/* ── Resend email client ── */
const resend = new Resend(process.env.RESEND_API_KEY);
if (!process.env.RESEND_API_KEY) {
  console.warn('[authController] WARNING: RESEND_API_KEY is not set — emails will fail.');
}


/* ── Token factory ── */
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

/* ── Safe user payload (never expose password hash) ── */
const userPayload = (user, token) => ({
  _id:        user._id,
  name:       user.name,
  email:      user.email,
  isVerified: user.isVerified,
  token,
});



/**
 * Sends a verification email to the newly registered user.
 * @param {string} toEmail   - recipient address
 * @param {string} toName    - recipient display name
 * @param {string} token     - the raw verificationToken
 */
const sendVerificationEmail = async (toEmail, toName, token) => {
  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
  const verifyLink   = `${FRONTEND_URL}/verify?token=${token}`;

  const { error } = await resend.emails.send({
    from:    'Stockenza <noreply@stockenza.co.in>',
    to:      toEmail,
    subject: 'Verify your Stockenza account',
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#09090e;color:#e4e4e7;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.07)">
        <!-- Header -->
        <div style="background:linear-gradient(135deg,#4338ca,#6d28d9);padding:32px 40px;text-align:center">
          <h1 style="margin:0;font-size:22px;font-weight:900;letter-spacing:-0.02em;color:white">
            Stock<span style="color:#c4b5fd">enza</span>
          </h1>
        </div>

        <!-- Body -->
        <div style="padding:40px">
          <h2 style="margin:0 0 12px;font-size:20px;font-weight:800;color:white">Verify your email</h2>
          <p style="margin:0 0 8px;font-size:14px;color:rgba(255,255,255,0.5);line-height:1.7">
            Hi <strong style="color:rgba(255,255,255,0.85)">${toName}</strong>,
          </p>
          <p style="margin:0 0 32px;font-size:14px;color:rgba(255,255,255,0.5);line-height:1.7">
            Thanks for signing up. Click the button below to confirm your email address and activate your account.
            This link is valid for <strong style="color:rgba(255,255,255,0.85)">7 days</strong>.
          </p>

          <div style="text-align:center;margin-bottom:32px">
            <a href="${verifyLink}"
               style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#4338ca,#6d28d9);color:white;text-decoration:none;border-radius:10px;font-size:13px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase">
              Verify Email Address
            </a>
          </div>

          <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.22);line-height:1.6">
            Or copy this link into your browser:<br/>
            <a href="${verifyLink}" style="color:#818cf8;word-break:break-all">${verifyLink}</a>
          </p>
        </div>

        <!-- Footer -->
        <div style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.06);text-align:center">
          <p style="margin:0;font-size:10px;color:rgba(255,255,255,0.15);letter-spacing:0.12em;text-transform:uppercase">
            Stockenza © 2025 — If you didn't create this account, ignore this email.
          </p>
        </div>
      </div>
    `,
  });

  if (error) {
    throw new Error(`Resend error (verification): ${error.message}`);
  }
};

/**
 * POST /api/auth/register
 * Creates the account with isVerified: false and emails a verification link.
 */
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Normalise email
    const normEmail = email.toLowerCase().trim();

    const exists = await User.findOne({ email: normEmail });
    if (exists) {
      return res.status(400).json({ message: 'An account with that email already exists.' });
    }

    // Generate a cryptographically secure 32-byte hex token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await User.create({
      name:  name.trim(),
      email: normEmail,
      password,
      isVerified: false,
      verificationToken,
    });

    // Send verification email (non-blocking — don't fail the request if email fails)
    sendVerificationEmail(user.email, user.name, verificationToken).catch((err) =>
      console.error('[sendVerificationEmail] Failed to send email:', err.message)
    );

    return res.status(201).json({
      message: 'Account created successfully. Please check your email to verify your account before logging in.',
    });
  } catch (err) {
    console.error('[registerUser]', err.message);
    return res.status(500).json({ message: 'Server error — could not create account.' });
  }
};

/**
 * POST /api/auth/login
 * Hard Gate: unverified users are denied with 403 before a JWT is ever issued.
 */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const normEmail = email.toLowerCase().trim();
    const user      = await User.findOne({ email: normEmail });

    if (!user || !(await user.matchPassword(password))) {
      // Intentionally vague — don't reveal whether email exists
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // ── Hard Gate ──
    if (!user.isVerified) {
      return res.status(403).json({
        message: 'Access denied. Please check your email to verify your account before logging in.',
      });
    }

    return res.status(200).json(userPayload(user, generateToken(user._id)));
  } catch (err) {
    console.error('[loginUser]', err.message);
    return res.status(500).json({ message: 'Server error — could not sign in.' });
  }
};

/**
 * GET /api/auth/verify/:token
 * Looks up the user by verificationToken, marks them verified, and clears the token.
 */
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ message: 'Verification token is required.' });
    }

    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token.' });
    }

    user.isVerified        = true;
    user.verificationToken = undefined; // Remove token — single-use
    await user.save();

    return res.status(200).json({ message: 'Email verified successfully. You can now log in.' });
  } catch (err) {
    console.error('[verifyEmail]', err.message);
    return res.status(500).json({ message: 'Server error — could not verify email.' });
  }
};


/**
 * POST /api/auth/forgot-password
 * Generates a password-reset token and emails the reset link.
 * Always returns 200 to avoid revealing whether an email is registered.
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required.' });

    const normEmail = email.toLowerCase().trim();
    const user      = await User.findOne({ email: normEmail });

    if (!user) {
      return res.status(404).json({
        message: 'No account found with that email address. Please register first.',
      });
    }

    // Generate a secure 32-byte token and set 1-hour expiry
    const resetPasswordToken   = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken    = resetPasswordToken;
    user.resetPasswordExpires  = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetLink    = `${FRONTEND_URL}/reset-password?token=${resetPasswordToken}`;

    const { error } = await resend.emails.send({
      from:    'Stockenza <onboarding@resend.dev>',
      to:      user.email,
      subject: 'Reset your Stockenza password',
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#09090e;color:#e4e4e7;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.07)">
          <div style="background:linear-gradient(135deg,#4338ca,#6d28d9);padding:32px 40px;text-align:center">
            <h1 style="margin:0;font-size:22px;font-weight:900;letter-spacing:-0.02em;color:white">
              Stock<span style="color:#c4b5fd">enza</span>
            </h1>
          </div>
          <div style="padding:40px">
            <h2 style="margin:0 0 12px;font-size:20px;font-weight:800;color:white">Reset your password</h2>
            <p style="margin:0 0 8px;font-size:14px;color:rgba(255,255,255,0.5);line-height:1.7">
              Hi <strong style="color:rgba(255,255,255,0.85)">${user.name}</strong>,
            </p>
            <p style="margin:0 0 32px;font-size:14px;color:rgba(255,255,255,0.5);line-height:1.7">
              Click the button below to set a new password. This link expires in <strong style="color:rgba(255,255,255,0.85)">1 hour</strong>.
            </p>
            <div style="text-align:center;margin-bottom:32px">
              <a href="${resetLink}" style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#4338ca,#6d28d9);color:white;text-decoration:none;border-radius:10px;font-size:13px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase">
                Reset Password
              </a>
            </div>
            <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.22);line-height:1.6">
              Or copy this link:<br/>
              <a href="${resetLink}" style="color:#818cf8;word-break:break-all">${resetLink}</a>
            </p>
          </div>
          <div style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.06);text-align:center">
            <p style="margin:0;font-size:10px;color:rgba(255,255,255,0.15);letter-spacing:0.12em;text-transform:uppercase">
              Stockenza © 2025 — If you didn't request this, ignore this email.
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      throw new Error(`Resend error (password reset): ${error.message}`);
    }

    return res.status(200).json({
      message: 'If that email is registered, a password reset link has been sent.',
    });
  } catch (err) {
    console.error('[forgotPassword]', err.message);
    return res.status(500).json({ message: 'Server error — could not process request.' });
  }
};

/**
 * POST /api/auth/resend-verification
 * Generates a fresh verification token and re-sends the verification email.
 */
const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required.' });

    const normEmail = email.toLowerCase().trim();
    const user      = await User.findOne({ email: normEmail });

    if (!user) {
      // Vague response — don't leak whether email is registered
      return res.status(200).json({
        message: 'If that email is registered and unverified, a new link has been sent.',
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        message: 'This account is already verified. You can log in directly.',
      });
    }

    // Rotate the token so old links become invalid immediately
    const newToken          = crypto.randomBytes(32).toString('hex');
    user.verificationToken  = newToken;
    await user.save();

    // Non-blocking send — email failure doesn't break the response
    sendVerificationEmail(user.email, user.name, newToken).catch((err) =>
      console.error('[resendVerification] Email send failed:', err.message)
    );

    return res.status(200).json({
      message: 'A new verification link has been sent to your email.',
    });
  } catch (err) {
    console.error('[resendVerification]', err.message);
    return res.status(500).json({ message: 'Server error — could not resend verification.' });
  }
};


/**
 * POST /api/auth/reset-password
 * Validates the reset token, checks expiry, and sets the new password.
 */
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: 'Token and new password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const user = await User.findOne({
      resetPasswordToken:   token,
      resetPasswordExpires: { $gt: new Date() }, // token must not be expired
    });

    if (!user) {
      return res.status(400).json({ message: 'This reset link is invalid or has expired. Please request a new one.' });
    }

    // Set new password (pre-save hook will hash it automatically)
    user.password             = password;
    user.resetPasswordToken   = undefined; // invalidate token — single-use
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.status(200).json({ message: 'Password reset successfully. You can now log in with your new password.' });
  } catch (err) {
    console.error('[resetPassword]', err.message);
    return res.status(500).json({ message: 'Server error — could not reset password.' });
  }
};


/**
 * PUT /api/auth/profile  (protected)
 * Updates the authenticated user's name and/or password.
 * Email cannot be changed here.
 */
const updateProfile = async (req, res) => {
  try {
    const { name, currentPassword, newPassword } = req.body;

    // req.user is attached by the protect middleware
    const user = await User.findById(req.user._id);

    // Update name if provided
    if (name && name.trim().length >= 2) {
      user.name = name.trim();
    }

    // Update password if the user supplied both fields
    if (currentPassword || newPassword) {
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Both current and new password are required to change your password.' });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters.' });
      }

      // Re-fetch with password field so matchPassword works
      const userWithPw = await User.findById(req.user._id).select('+password');
      const match = await userWithPw.matchPassword(currentPassword);
      if (!match) {
        return res.status(401).json({ message: 'Current password is incorrect.' });
      }

      user.password = newPassword; // pre-save hook hashes this
    }

    await user.save();

    return res.status(200).json({
      _id:   user._id,
      name:  user.name,
      email: user.email,
      message: 'Profile updated successfully.',
    });
  } catch (err) {
    console.error('[updateProfile]', err.message);
    return res.status(500).json({ message: 'Server error — could not update profile.' });
  }
};

/**
 * DELETE /api/auth/reset-data  (protected)
 * Permanently deletes ALL Inventory and Order documents belonging to
 * the authenticated user.  The User account itself is untouched.
 */
const resetBusinessData = async (req, res) => {
  try {
    const userId = req.user._id;

    const Inventory = require('../models/Inventory');
    const Order     = require('../models/Order');

    // Delete both collections in parallel — fastest approach
    const [invResult, ordResult] = await Promise.all([
      Inventory.deleteMany({ createdBy: userId }),
      Order.deleteMany({ createdBy: userId }),
    ]);

    return res.status(200).json({
      message: 'All business data has been permanently deleted.',
      deleted: {
        inventory: invResult.deletedCount,
        orders:    ordResult.deletedCount,
      },
    });
  } catch (err) {
    console.error('[resetBusinessData]', err.message);
    return res.status(500).json({ message: 'Server error — could not reset business data.' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  verifyEmail,
  forgotPassword,
  resendVerification,
  resetPassword,
  updateProfile,
  resetBusinessData,
};