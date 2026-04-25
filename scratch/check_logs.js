const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: '../backend/.env' });

async function checkLogs() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zeptomail_db');
  
  const EmailLog = mongoose.model('EmailLog', new mongoose.Schema({
    recipients: [String],
    subject: String,
    status: String,
    sentBy: mongoose.Schema.Types.ObjectId,
    sentAt: Date
  }));

  const logs = await EmailLog.find();
  console.log('Total logs in DB:', logs.length);
  logs.forEach(log => {
    console.log(`- Subject: ${log.subject}, Status: ${log.status}, sentBy: ${log.sentBy || 'NONE'}`);
  });

  process.exit();
}

checkLogs();
