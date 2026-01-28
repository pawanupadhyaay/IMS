// Simple owner setup - run this in Node.js
const mongoose = require('mongoose');
const User = require('./models/User');

async function setup() {
  try {
    await mongoose.connect('mongodb+srv://samaywatchims:samaywatchims@cluster0.rwy3f.mongodb.net/samay_watch_ims?retryWrites=true&w=majority');

    // Just update the existing user's role to owner
    const result = await User.findOneAndUpdate(
      { email: 'hiteshkathpal20@gmail.com' },
      { role: 'owner' },
      { new: true }
    );

    if (result) {
      console.log('✅ Owner role assigned successfully!');
      console.log('User:', result.name, result.email);
      console.log('Role:', result.role);
    } else {
      console.log('❌ User not found with email: hiteshkathpal20@gmail.com');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit();
  }
}

setup();
