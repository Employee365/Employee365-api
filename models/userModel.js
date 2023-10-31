const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email address'],
    unique: true,
    lowercase: true,
    validator: [validator.isEmail, 'Please input a valid email'],
  },
  department: {
    type: String,
    required: [true, 'A user must belong to a department'],
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same!',
    },
  },
  role: {
    type: String,
    enum: ['employee', 'manager', 'admin'],
    default: 'employee',
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

// ENCRYPTING PASSWORDS BEFORE SAVING TO DATABASE
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;
  next();
});

// MIDDLEWARE TO UPDATE changePasswordAt property
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;

  next();
});

// QUERY MIDDLEWARE TO HIDE INACTIVE ACCOUNTS
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

// INSTANCE METHOD TO COMPARE PASSWORDS (PASSWORD IN DOCUMENT AND PASSWORD USER PROVIDES TO LOGIN)
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// INSTANCE METHOD TO CHECK IF USER HAS CHANGED PASSWORD AFTER JWT WAS ISSUED
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }

  //False means NOT Changed

  return false;
};

// INSTANCE TO CREATE PASSWORD RESET TOKEN
userSchema.methods.createPasswordResetToken = function () {
  // 1) Create reset token string
  const resetToken = crypto.randomBytes(32).toString('hex');

  // 2) Hash token and save to DB
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, this.passwordResetToken);

  // 3) Setting limit to token usability
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// Create 'User' model
const User = mongoose.model('User', userSchema);

// Export 'User' model
module.exports = User;
