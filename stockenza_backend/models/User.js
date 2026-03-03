const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:                 { type: String, required: true },
  email:                { type: String, required: true, unique: true },
  password:             { type: String, required: false },
  googleId:             { type: String, sparse: true },
  isVerified:           { type: Boolean, default: false },
  verificationToken:    { type: String },
  resetPasswordToken:   { type: String },
  resetPasswordExpires: { type: Date },
  billingInfo: {
    storeName: { type: String, default: '' },
    address:   { type: String, default: '' },
    city:      { type: String, default: '' },
    state:     { type: String, default: '' },
    pincode:   { type: String, default: '' },
    gstin:     { type: String, default: '' },
    pan:       { type: String, default: '' },
    phone:     { type: String, default: '' },
  },
}, { timestamps: true });

/**
 * TTL Partial Index — auto-deletes unverified users 7 days after createdAt.
 *
 * The `partialFilterExpression` ensures this index ONLY applies to documents
 * where isVerified is false, so verified users are NEVER auto-deleted.
 *
 * NOTE: This index must be created on the MongoDB server side the first time
 * the app runs. You can also create it manually in MongoDB Atlas or mongosh:
 *   db.users.createIndex(
 *     { createdAt: 1 },
 *     { expireAfterSeconds: 604800, partialFilterExpression: { isVerified: false } }
 *   )
 */
userSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 604800, // 7 days = 7 × 24 × 60 × 60
    partialFilterExpression: { isVerified: false },
  }
);

// Pre-save hook: Hash the password before saving it to the database
// Uses the async (no-callback) style required by Mongoose 6+.
// Do NOT add a `next` parameter — Mongoose doesn't pass it to async hooks.
userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Helper method: Compare plain text password with hashed password in DB
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);