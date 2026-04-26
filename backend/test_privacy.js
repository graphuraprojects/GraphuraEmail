const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const http = require('http');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/zeptomail_db';
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';

async function runTest() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    
    // Find a user to act as sender
    const User = mongoose.model('User', new mongoose.Schema({ email: String, role: String }));
    const user = await User.findOne();
    
    if (!user) {
      console.error('No user found in DB. Please register a user first.');
      process.exit(1);
    }

    console.log(`Testing as user: ${user.email}`);
    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET);

    const payload = JSON.stringify({
      recipients: ['test_user1@example.com', 'test_user2@example.com'],
      subject: 'Privacy Test ' + new Date().toLocaleTimeString(),
      body: '<p>This is a test for individual sending privacy.</p>'
    });

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/send-emails',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': payload.length,
        'Authorization': `Bearer ${token}`
      }
    };

    console.log('Sending request to /api/send-emails...');
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        console.log('Server Response:', data);
        console.log('\nTEST COMPLETED. Check backend terminal for [STEP 1] and [STEP 2] logs.');
        process.exit(0);
      });
    });

    req.on('error', (error) => {
      console.error('Request Error:', error.message);
      process.exit(1);
    });

    req.write(payload);
    req.end();
  } catch (error) {
    console.error('Test Failed:', error.message);
    process.exit(1);
  }
}

runTest();
