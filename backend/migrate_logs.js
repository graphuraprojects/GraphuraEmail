const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);
  const User = mongoose.model('User', new mongoose.Schema({}));
  const EmailLog = mongoose.model('EmailLog', new mongoose.Schema({ sentBy: mongoose.Schema.Types.ObjectId }));

  const user = await User.findOne();
  if (user) {
    const result = await EmailLog.updateMany(
      { sentBy: { $exists: false } },
      { $set: { sentBy: user._id } }
    );
    console.log(`Successfully migrated ${result.modifiedCount} old logs to user ${user._id}`);
  } else {
    console.log('No user found in database. Please register first.');
  }
  process.exit();
}

migrate();
