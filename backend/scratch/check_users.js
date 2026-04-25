const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
});

const User = mongoose.model('User', userSchema);

async function checkUsers() {
  await mongoose.connect(process.env.MONGODB_URI);
  const users = await User.find();
  console.log('Users:', JSON.stringify(users, null, 2));
  await mongoose.disconnect();
}

checkUsers();
