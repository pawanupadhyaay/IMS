require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/database');

async function setOwnerRole() {
  try {
    await connectDB();

    const ownerEmail = 'hiteshkathpal20@gmail.com';
    const ownerPassword = 'Raisagar1902';

    // Check if the owner user already exists
    let ownerUser = await User.findOne({ email: ownerEmail });

    if (ownerUser) {
      // Update existing user to owner role
      await User.findByIdAndUpdate(ownerUser._id, { role: 'owner' });
      console.log(`✅ Existing user ${ownerUser.name} (${ownerUser.email}) has been set as OWNER`);
    } else {
      // Create new owner user
      ownerUser = await User.create({
        name: 'Hitesh Kathpal',
        email: ownerEmail,
        password: ownerPassword,
        role: 'owner'
      });
      console.log(`✅ New owner user created: ${ownerUser.name} (${ownerUser.email})`);
    }

    console.log('🎉 Owner account setup complete!');
    console.log('📧 Email: hiteshkathpal20@gmail.com');
    console.log('🔐 Password: Raisagar1902');
    console.log('👑 Role: OWNER');
    console.log('📊 They can now access the Activity History page and all owner features.');

    process.exit(0);
  } catch (error) {
    console.error('Error setting up owner role:', error);
    process.exit(1);
  }
}

setOwnerRole();
