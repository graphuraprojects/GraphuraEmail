const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const emailLogSchema = new mongoose.Schema({
  recipients: [String],
  subject: String,
  body: String,
  status: String,
  errorReason: String,
  messageId: String,
  size: { type: Number, default: 0 },
  sentBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isDeleted: { type: Boolean, default: false },
  sentAt: { type: Date, default: Date.now }
});

const EmailLog = mongoose.model('EmailLog', emailLogSchema);

async function checkDb() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');
  
  const totalLogs = await EmailLog.countDocuments();
  console.log('Total Email Logs:', totalLogs);
  
  const successLogs = await EmailLog.find({ status: 'success' }).limit(5);
  console.log('Sample Success Logs:', JSON.stringify(successLogs, null, 2));
  
  const dailyLogs = await EmailLog.countDocuments({ 
    sentAt: { $gte: new Date(new Date().setHours(0,0,0,0)) } 
  });
  console.log('Logs Sent Today (Total across all users):', dailyLogs);

  await mongoose.disconnect();
}

checkDb();
