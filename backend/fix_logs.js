const mongoose = require('mongoose');
require('dotenv').config();

async function fix() {
  await mongoose.connect(process.env.MONGODB_URI);
  const result = await mongoose.connection.db.collection('emaillogs').updateMany(
    { isDeleted: { $exists: false } },
    { $set: { isDeleted: false } }
  );
  console.log(`Standardized ${result.modifiedCount} logs with isDeleted: false`);
  process.exit();
}

fix();
