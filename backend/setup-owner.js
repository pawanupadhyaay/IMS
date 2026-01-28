// One-time script to set up owner account
// Run this once to create/setup the owner account

const mongoose = require('mongoose');
const User = require('./models/User');

async function setupOwner() {
  try {
    // Connect to database
    await mongoose.connect('mongodb+srv://samaywatchims:samaywatchims@cluster0.rwy3f.mongodb.net/samay_watch_ims?retryWrites=true&w=majority');

    const ownerEmail = 'hiteshkathpal20@gmail.com';
    const ownerPassword = 'Raisagar1902';

    // Check if owner exists
    let owner = await User.findOne({ email: ownerEmail });

    if (owner) {
      // Update existing user to owner
      await User.findByIdAndUpdate(owner._id, { role: 'owner' });
      console.log('✅ Updated existing user to OWNER role');
    } else {
      // Create new owner
      owner = new User({
        name: 'Hitesh Kathpal',
        email: ownerEmail,
        password: ownerPassword,
        role: 'owner'
      });
      await owner.save();
      console.log('✅ Created new OWNER account');
    }

    console.log('🎉 Owner Setup Complete!');
    console.log('👤 Name: Hitesh Kathpal');
    console.log('📧 Email: hiteshkathpal20@gmail.com');
    console.log('🔐 Password: Raisagar1902');
    console.log('👑 Role: OWNER');
    console.log('📊 Access: Full system access including Activity History');

    process.exit(0);
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

setupOwner();







