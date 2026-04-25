const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const emailLogSchema = new mongoose.Schema({
  recipients: [String],
  subject: String,
  body: String,
  status: String,
  size: { type: Number, default: 0 }
});

const EmailLog = mongoose.model('EmailLog', emailLogSchema);

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');
  
  // Set size to 1KB (1024 bytes) for any log that has size 0 or undefined
  const result = await EmailLog.updateMany(
    { $or: [{ size: 0 }, { size: { $exists: false } }] },
    { $set: { size: 1024 } }
  );
  
  console.log(`Migrated ${result.modifiedCount} logs.`);
  await mongoose.disconnect();
}

migrate();
