const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  role: { 
    type: String, 
    default: 'distribution_staff', 
    enum: ['admin', 'inventory_manager', 'procurement_staff', 'distribution_staff', 'staff'] // 'staff' kept for backward compatibility
  },
  provider: { type: String, enum: ['local'], default: 'local' } // Track auth method
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Hash password before saving
UserSchema.pre('save', async function() {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return;
  
  // Also, don't try to hash an empty password
  if (!this.password) return;
  
  this.password = await bcrypt.hash(this.password, 10);
});

// Method to check if user has password (for local auth)
UserSchema.methods.hasPassword = function() {
  return !!this.password;
};

// Export the model directly
const User = mongoose.model('User', UserSchema);

module.exports = User;