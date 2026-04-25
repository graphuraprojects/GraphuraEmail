const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { SendMailClient } = require('zeptomail');
const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- MODELS ---

const userSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin', 'hr', 'intern'], default: 'user' },
  department: { type: String, default: 'General' },
  phone: { type: String, default: '' },
  designation: { type: String, default: '' },
  location: { type: String, default: '' },
  secretKey: { type: String, default: '' },
  gender: { type: String, enum: ['Male', 'Female', 'Other', ''], default: '' },
  joiningDate: { type: Date, default: Date.now },
  storageLimit: { type: Number, default: 10 * 1024 * 1024 }, // 10MB Default
  dailyLimit: { type: Number, default: 100 }, // 100 Emails Default
  status: { type: String, enum: ['active', 'inactive', 'blocked'], default: 'active' },
  isSoftDeleted: { type: Boolean, default: false },
  lastLogin: { type: Date, default: Date.now },
  resetPasswordToken: { type: String, default: '' },
  resetPasswordExpires: { type: Date }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

const emailLogSchema = new mongoose.Schema({
  recipients: [String],
  subject: String,
  body: String,
  status: String,
  errorReason: String,
  messageId: String,
  size: { type: Number, default: 0 }, // Size in bytes
  sentBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isDeleted: { type: Boolean, default: false },
  sentAt: { type: Date, default: Date.now }
});

const EmailLog = mongoose.model('EmailLog', emailLogSchema);

const scheduledEmailSchema = new mongoose.Schema({
  recipients: [String],
  subject: String,
  body: String,
  scheduledAt: Date,
  status: { type: String, default: 'pending' },
  sentBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const ScheduledEmail = mongoose.model('ScheduledEmail', scheduledEmailSchema);

const SystemSettingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed }
});
const SystemSetting = mongoose.model('SystemSetting', SystemSettingSchema);

const GatewayHistorySchema = new mongoose.Schema({
  type: { type: String, enum: ['gateway', 'status'], default: 'gateway' },
  from: String,
  to: String,
  changedBy: String,
  timestamp: { type: Date, default: Date.now }
});
const GatewayHistory = mongoose.model('GatewayHistory', GatewayHistorySchema);

// --- AUTH MIDDLEWARE ---

const auth = async (req, res, next) => {
  const path = req.path;
  const method = req.method;
  console.log(`[AUTH] Request: ${method} ${path}`);

  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    console.error(`[AUTH] Failed: No token for ${path}`);
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check user status in database for real-time blocking
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(401).json({ error: 'User not found' });

    const status = user.status || 'active';
    if (status !== 'active') {
      return res.status(403).json({
        error: 'Account Deactivated',
        message: 'Your account has been deactivated or blocked by an administrator.'
      });
    }

    console.log(`[AUTH] Success: User ${user.email} verified for ${path}`);
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (err) {
    console.error(`[AUTH] Error verifying token for ${path}:`, err.message);
    res.status(401).json({ error: 'Invalid token' });
  }
};

const adminAuth = (req, res, next) => {
  auth(req, res, () => {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  });
};

// --- AUTH ROUTES ---

app.post('/api/auth/register', async (req, res) => {
  const { email, password, role, adminCode, secretKey } = req.body;
  if (!email || !password || (!secretKey && role !== 'admin')) return res.status(400).json({ error: 'Email, password, and Secret Key are required' });

  // Validate User Secret Key from .env
  if (secretKey !== process.env.USER_REGISTRATION_KEY && role !== 'admin') {
    return res.status(403).json({ error: 'Invalid Registration Secret Key' });
  }

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ error: 'User already exists' });

    const userCount = await User.countDocuments();
    let assignedRole = 'user';

    // First user is always admin
    if (userCount === 0) {
      assignedRole = 'admin';
    } else if (role === 'admin') {
      // Secret key check for new admins
      if (adminCode !== process.env.ADMIN_REGISTRATION_KEY) {
        return res.status(403).json({ error: 'Invalid Admin Registration Code' });
      }
      assignedRole = 'admin';
    }

    const { name, department, phone, designation, gender, joiningDate, location, secretKey } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({
      email,
      password: hashedPassword,
      role: assignedRole,
      name: name || email.split('@')[0],
      department: department || 'General',
      phone: phone || '',
      designation: designation || '',
      location: location || '',
      secretKey: secretKey || '',
      gender: gender || '',
      joiningDate: joiningDate || Date.now()
    });
    await user.save();

    console.log('Assigned role:', assignedRole);
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, email: user.email, role: user.role });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const token = require('crypto').randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetUrl = `${req.headers.origin}/reset-password?token=${token}`;
    
    if (mailGateway) {
      try {
        await mailGateway.sendMail({
          from: { address: process.env.ZEPTOMAIL_SENDER_EMAIL, name: process.env.ZEPTOMAIL_SENDER_NAME },
          to: [{ email_address: { address: email, name: user.name } }],
          subject: 'Password Reset Request',
          html_body: `
            <div style="font-family: sans-serif; padding: 20px; color: #1e293b; max-width: 600px; margin: auto; border: 1px solid #f1f5f9; border-radius: 12px;">
              <h2 style="color: #0f172a;">Password Reset Request</h2>
              <p>Hello ${user.name || 'User'},</p>
              <p>We received a request to reset your password. Click the button below to proceed:</p>
              <div style="margin: 30px 0; text-align: center;">
                <a href="${resetUrl}" style="background: #4f46e5; color: #fff; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 700; display: inline-block;">Reset Password</a>
              </div>
              <p style="font-size: 0.85rem; color: #64748b; line-height: 1.5;">This secure link will expire in 1 hour. If you didn't request this, you can safely ignore this email.</p>
              <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
              <p style="font-size: 0.75rem; color: #94a3b8; text-align: center;">Graphura Enterprise Mail Security</p>
            </div>
          `
        });
      } catch (mailErr) {
        console.error('[FORGOT_PASS] MAIL SEND FAILED:', mailErr.message);
      }
    }

    res.json({ message: 'Reset link sent to your email' });
  } catch (err) {
    console.error('[FORGOT_PASS] ERROR:', err.message);
    res.status(500).json({ error: 'Failed to initiate password reset' });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  const { token, password } = req.body;
  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ error: 'Password reset token is invalid or has expired' });

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = '';
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password has been reset successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Password reset failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password, role } = req.body;
  console.log('Login attempt:', { email, requestedRole: role });
  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log('Login failed: User not found', email);
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Login failed: Password mismatch', email);
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check if user is active (allow undefined for legacy users)
    const userStatus = user.status || 'active';
    if (userStatus !== 'active') {
      console.log('Login failed: Account status', userStatus, email);
      return res.status(403).json({ error: `Your account is ${userStatus}. Please contact administrator.` });
    }

    // Role check: If login was initiated from Admin Panel, user must have admin role
    if (role === 'admin' && user.role !== 'admin') {
      console.log('Login failed: Unauthorized admin access attempt', email);
      return res.status(403).json({ error: 'Access denied. You do not have administrative privileges.' });
    }

    // Ensure user has necessary defaults if missing (for legacy accounts)
    if (!user.role) user.role = 'user';
    if (!user.storageLimit) user.storageLimit = 10 * 1024 * 1024;
    if (!user.dailyLimit) user.dailyLimit = 100;

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    console.log('Login successful:', { email: user.email, role: user.role });
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      email: user.email,
      role: user.role,
      status: user.status || 'active'
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- ADMIN ROUTES ---

app.get('/api/admin/users', adminAuth, async (req, res) => {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Filter out soft deleted users
    const users = await User.aggregate([
      { $match: { isSoftDeleted: { $ne: true } } },
      {
        $lookup: {
          from: 'emaillogs',
          localField: '_id',
          foreignField: 'sentBy',
          as: 'logs'
        }
      },
      {
        $project: {
          email: 1,
          role: 1,
          status: 1,
          storageLimit: 1,
          dailyLimit: 1,
          dailyLimit: 1,
          createdAt: 1,
          name: 1,
          department: 1,
          lastLogin: 1,
          totalUsedStorage: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: "$logs",
                    as: "log",
                    cond: { $eq: ["$$log.status", "success"] }
                  }
                },
                as: "successLog",
                in: "$$successLog.size"
              }
            }
          },
          sentToday: {
            $size: {
              $filter: {
                input: "$logs",
                as: "log",
                cond: {
                  $and: [
                    { $eq: ["$$log.status", "success"] },
                    { $gte: ["$$log.sentAt", twentyFourHoursAgo] }
                  ]
                }
              }
            }
          },
          totalSentAllTime: {
            $size: {
              $filter: {
                input: "$logs",
                as: "log",
                cond: { $eq: ["$$log.status", "success"] }
              }
            }
          },
          totalFailedAllTime: {
            $size: {
              $filter: {
                input: "$logs",
                as: "log",
                cond: { $eq: ["$$log.status", "failed"] }
              }
            }
          }
        }
      },
      { $sort: { createdAt: -1 } }
    ]);

    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/users/:id', adminAuth, async (req, res) => {
  try {
    const { status, dailyLimit, storageLimit, role, name, department } = req.body;

    // Prevent admin from deactivating themselves or changing their own role
    if (req.params.id === req.userId && (status === 'inactive' || role === 'user')) {
      return res.status(400).json({ error: 'You cannot deactivate yourself or demote your own admin role.' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { status, dailyLimit, storageLimit, role, name, department } },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/users/:id', adminAuth, async (req, res) => {
  try {
    if (req.params.id === req.userId) {
      return res.status(400).json({ error: 'You cannot delete your own admin account.' });
    }

    // Soft delete
    await User.findByIdAndUpdate(req.params.id, { $set: { isSoftDeleted: true } });
    // Cleanup associated data
    await EmailLog.deleteMany({ sentBy: req.params.id });
    await ScheduledEmail.deleteMany({ sentBy: req.params.id });

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/impersonate/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.isSoftDeleted) return res.status(400).json({ error: 'Cannot impersonate deleted user' });

    console.log('Admin impersonating user:', user.email);
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      email: user.email,
      role: user.role,
      status: user.status || 'active'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/stats', adminAuth, async (req, res) => {
  try {
    const [totalUsers, activeUsers, adminUsers, creditSetting] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: 'active' }),
      User.countDocuments({ role: 'admin' }),
      SystemSetting.findOne({ key: 'total_purchased_credits' })
    ]);

    const emailStats = await EmailLog.aggregate([
      {
        $group: {
          _id: null,
          totalSent: { $sum: 1 },
          successCount: { $sum: { $cond: [{ $eq: ["$status", "success"] }, 1, 0] } },
          failedCount: { $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] } },
          totalSize: { $sum: "$size" }
        }
      }
    ]);

    const stats = emailStats[0] || {
      totalSent: 0,
      successCount: 0,
      failedCount: 0,
      totalSize: 0
    };

    const totalPurchased = creditSetting ? creditSetting.value : 0;
    const remainingCredits = totalPurchased - stats.successCount;

    res.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        admins: adminUsers
      },
      emails: {
        ...stats,
        totalPurchased,
        remainingCredits: Math.max(0, remainingCredits)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/credits', adminAuth, async (req, res) => {
  try {
    const { totalPurchased } = req.body;
    if (typeof totalPurchased !== 'number') return res.status(400).json({ error: 'Invalid credit value' });

    await SystemSetting.findOneAndUpdate(
      { key: 'total_purchased_credits' },
      { value: totalPurchased },
      { upsert: true, new: true }
    );
    res.json({ message: 'Credits updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/logs', adminAuth, async (req, res) => {
  try {
    const logs = await EmailLog.find()
      .populate('sentBy', 'email')
      .sort({ sentAt: -1 })
      .limit(100);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- EMAIL ROUTES ---

const getMailClient = async () => {
  const settings = await SystemSetting.find({ 
    key: { $in: ['ZEPTOMAIL_API_KEY', 'ZEPTOMAIL_URL', 'MAIL_GATEWAY', 'AWS_ACCESS_KEY', 'AWS_SECRET_KEY', 'AWS_REGION'] } 
  });
  
  const gateway = settings.find(s => s.key === 'MAIL_GATEWAY')?.value || 'zeptomail';
  
  if (gateway === 'aws') {
    const accessKey = settings.find(s => s.key === 'AWS_ACCESS_KEY')?.value || process.env.AWS_ACCESS_KEY;
    const secretKey = settings.find(s => s.key === 'AWS_SECRET_KEY')?.value || process.env.AWS_SECRET_KEY;
    const region = settings.find(s => s.key === 'AWS_REGION')?.value || process.env.AWS_REGION || 'us-east-1';
    
    return {
      type: 'aws',
      client: new SESClient({
        region,
        credentials: { accessKeyId: accessKey, secretAccessKey: secretKey }
      })
    };
  }

  // ZeptoMail
  const apiKey = settings.find(s => s.key === 'ZEPTOMAIL_API_KEY')?.value || process.env.ZEPTOMAIL_API_KEY;
  const url = settings.find(s => s.key === 'ZEPTOMAIL_URL')?.value || "https://api.zeptomail.in/";
  return {
    type: 'zeptomail',
    client: new SendMailClient({ url, token: apiKey })
  };
};

// Global client wrapper
let mailGateway;
getMailClient().then(g => mailGateway = g);

const getSenderSettings = async () => {
  const settings = await SystemSetting.find({ 
    key: { $in: ['ZEPTOMAIL_SENDER_EMAIL', 'ZEPTOMAIL_SENDER_NAME', 'AWS_SENDER_EMAIL', 'MAIL_GATEWAY'] } 
  });
  const gateway = settings.find(s => s.key === 'MAIL_GATEWAY')?.value || 'zeptomail';
  
  if (gateway === 'aws') {
    return {
      email: settings.find(s => s.key === 'AWS_SENDER_EMAIL')?.value || process.env.AWS_SENDER_EMAIL,
      name: settings.find(s => s.key === 'ZEPTOMAIL_SENDER_NAME')?.value || process.env.ZEPTOMAIL_SENDER_NAME
    };
  }

  return {
    email: settings.find(s => s.key === 'ZEPTOMAIL_SENDER_EMAIL')?.value || process.env.ZEPTOMAIL_SENDER_EMAIL,
    name: settings.find(s => s.key === 'ZEPTOMAIL_SENDER_NAME')?.value || process.env.ZEPTOMAIL_SENDER_NAME
  };
};

app.get('/api/admin/settings', adminAuth, async (req, res) => {
  try {
    const settings = await SystemSetting.find();
    const keys = [
      'ZEPTOMAIL_API_KEY', 'ZEPTOMAIL_SENDER_EMAIL', 'ZEPTOMAIL_SENDER_NAME', 'ZEPTOMAIL_URL',
      'MAIL_GATEWAY', 'AWS_ACCESS_KEY', 'AWS_SECRET_KEY', 'AWS_REGION', 'AWS_SENDER_EMAIL'
    ];
    const result = {};
    keys.forEach(k => {
      const s = settings.find(set => set.key === k);
      result[k] = s ? s.value : (process.env[k] || '');
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/settings/history', adminAuth, async (req, res) => {
  try {
    const history = await GatewayHistory.find().sort({ timestamp: -1 }).limit(20);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/settings', adminAuth, async (req, res) => {
  try {
    const updates = req.body;
    
    // Get current states for logging
    const currentGatewaySetting = await SystemSetting.findOne({ key: 'MAIL_GATEWAY' });
    const oldGateway = currentGatewaySetting ? currentGatewaySetting.value : 'zeptomail';
    
    const currentStatusSetting = await SystemSetting.findOne({ key: 'SYSTEM_EMAIL_STATUS' });
    const oldStatus = currentStatusSetting ? currentStatusSetting.value : 'active';

    for (const [key, value] of Object.entries(updates)) {
      await SystemSetting.findOneAndUpdate(
        { key },
        { key, value },
        { upsert: true, new: true }
      );
    }
    
    // Log Gateway Change
    if (updates.MAIL_GATEWAY && updates.MAIL_GATEWAY !== oldGateway) {
      await new GatewayHistory({
        type: 'gateway',
        from: oldGateway,
        to: updates.MAIL_GATEWAY,
        changedBy: req.userEmail || 'Admin'
      }).save();
    }

    // Log Status Change
    if (updates.SYSTEM_EMAIL_STATUS && updates.SYSTEM_EMAIL_STATUS !== oldStatus) {
      await new GatewayHistory({
        type: 'status',
        from: oldStatus,
        to: updates.SYSTEM_EMAIL_STATUS,
        changedBy: req.userEmail || 'Admin'
      }).save();
    }

    try {
      mailGateway = await getMailClient();
    } catch (gatewayErr) {
      console.error('[SETTINGS] GATEWAY RE-INIT FAILED:', gatewayErr.message);
    }
    
    res.json({ message: 'Settings updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/ping', (req, res) => res.json({ status: 'alive' }));

app.post('/api/schedule-email', auth, async (req, res) => {
  const { recipients, subject, body, scheduledAt } = req.body;
  if (!recipients || !Array.isArray(recipients) || recipients.length === 0) return res.status(400).json({ error: 'Recipients required' });
  if (!scheduledAt) return res.status(400).json({ error: 'Scheduled date required' });

  try {
    const user = await User.findById(req.userId);
    const emailSize = Buffer.byteLength((subject || '') + (body || ''), 'utf8') * recipients.length;

    // Skip limits for admins
    if (req.userRole !== 'admin') {
      // 1. Total Storage Limit Check
      const logs = await EmailLog.find({ sentBy: req.userId, status: 'success' });
      const totalUsed = logs.reduce((acc, log) => acc + (log.size || 0), 0);

      if (totalUsed + emailSize > user.storageLimit) {
        return res.status(403).json({ error: `Storage limit exceeded.` });
      }

      // 2. Daily Limit Check (250/24h)
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const sentRecently = await EmailLog.countDocuments({
        sentBy: req.userId,
        status: 'success',
        sentAt: { $gte: twentyFourHoursAgo }
      });

      if (sentRecently + recipients.length > (user.dailyLimit || 250)) {
        return res.status(403).json({ error: `Daily limit (${user.dailyLimit || 250}) reached. Sent in last 24h: ${sentRecently}.` });
      }
    }

    const scheduled = new ScheduledEmail({ recipients, subject, body, scheduledAt: new Date(scheduledAt), sentBy: req.userId });
    await scheduled.save();
    res.status(200).json({ message: 'Email scheduled', data: scheduled });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/send-emails', auth, async (req, res) => {
  console.log('--- Incoming Send Request ---');
  const { recipients, subject, body } = req.body;

  if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
    console.error('Validation Failed: No recipients provided');
    return res.status(400).json({ error: 'At least one recipient is required.' });
  }

  try {
    // Check Global Kill Switch
    const systemStatus = await SystemSetting.findOne({ key: 'SYSTEM_EMAIL_STATUS' });
    if (systemStatus && systemStatus.value === 'inactive') {
      return res.status(503).json({ error: 'Email services are currently suspended by administrator.' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      console.error('Auth Failed: User not found in DB');
      return res.status(401).json({ error: 'Session invalid' });
    }
    console.log(`User: ${user.email}, Role: ${req.userRole}`);
    const emailSize = Buffer.byteLength((subject || '') + (body || ''), 'utf8') * recipients.length;

    // Skip limits for admins
    if (req.userRole !== 'admin') {
      // 1. Total Storage Limit Check
      const logs = await EmailLog.find({ sentBy: req.userId, status: 'success' });
      const totalUsed = logs.reduce((acc, log) => acc + (log.size || 0), 0);

      if (totalUsed + emailSize > user.storageLimit) {
        return res.status(403).json({ error: `Storage limit exceeded.` });
      }

      // 2. Daily Limit Check (250/24h)
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const sentRecently = await EmailLog.countDocuments({
        sentBy: req.userId,
        status: 'success',
        sentAt: { $gte: twentyFourHoursAgo }
      });

      if (sentRecently + recipients.length > (user.dailyLimit || 250)) {
        return res.status(403).json({ error: `Daily limit (${user.dailyLimit || 250}) reached. Sent in last 24h: ${sentRecently}.` });
      }
    }

    console.log(`Attempting to send email via ${mailGateway.type}...`);
    const sender = await getSenderSettings();
    let response;
    let messageId = 'N/A';

    if (mailGateway.type === 'aws') {
      const command = new SendEmailCommand({
        Source: sender.name ? `${sender.name} <${sender.email}>` : sender.email,
        Destination: { ToAddresses: recipients },
        Message: {
          Subject: { Data: subject || 'No Subject' },
          Body: { Html: { Data: body || '<p>No content</p>' } }
        }
      });
      const resAWS = await mailGateway.client.send(command);
      messageId = resAWS.MessageId;
      response = { message: 'AWS Success', data: resAWS };
    } else {
      const formattedRecipients = recipients.map(email => ({ email_address: { address: email, name: email.split('@')[0] } }));
      const mailOptions = {
        from: { address: sender.email, name: sender.name },
        to: formattedRecipients,
        subject: subject || 'No Subject',
        htmlbody: body || '<p>No content</p>'
      };
      response = await mailGateway.client.sendMail(mailOptions);
      messageId = response.data?.[0]?.message_id || 'N/A';
    }

    const log = new EmailLog({
      recipients, subject, body,
      status: 'success',
      messageId,
      size: emailSize,
      sentBy: req.userId
    });

    await log.save();
    console.log('Email Sent & Logged Successfully');
    res.status(200).json({ message: 'Emails sent', data: response });
  } catch (error) {
    console.error('CRITICAL ERROR during email send:');
    console.error(error);

    // Extract precise error message from ZeptoMail SDK
    let errorMsg = 'Unknown Error';
    if (error.error && error.error.message) {
      errorMsg = error.error.message;
    } else if (error.message) {
      errorMsg = error.message;
    }

    if (error.error && error.error.details) {
      console.error('Error Details:', JSON.stringify(error.error.details));
    }

    const log = new EmailLog({
      recipients, subject, body,
      status: 'failed',
      errorReason: errorMsg,
      sentBy: req.userId
    });
    await log.save();
    res.status(500).json({ error: errorMsg });
  }
});

setInterval(async () => {
  try {
    // Check Kill Switch for Cron
    const systemStatus = await SystemSetting.findOne({ key: 'SYSTEM_EMAIL_STATUS' });
    if (systemStatus && systemStatus.value === 'inactive') {
      console.log('[CRON] Email services suspended. Skipping scheduled tasks.');
      return;
    }

    const now = new Date();
    const pending = await ScheduledEmail.find({ status: 'pending', scheduledAt: { $lte: now } });
    if (pending.length > 0) {
      const sender = await getSenderSettings();
      for (const mail of pending) {
        try {
          if (mailGateway.type === 'aws') {
            await mailGateway.client.send(new SendEmailCommand({
              Source: sender.name ? `${sender.name} <${sender.email}>` : sender.email,
              Destination: { ToAddresses: mail.recipients },
              Message: { Subject: { Data: mail.subject }, Body: { Html: { Data: mail.body } } }
            }));
          } else {
            const formatted = mail.recipients.map(e => ({ email_address: { address: e, name: e.split('@')[0] } }));
            await mailGateway.client.sendMail({
              from: { address: sender.email, name: sender.name },
              to: formatted, subject: mail.subject, htmlbody: mail.body
            });
          }
          mail.status = 'sent';
          await mail.save();
          await new EmailLog({ recipients: mail.recipients, subject: mail.subject, body: mail.body, status: 'success', sentBy: mail.sentBy, sentAt: now }).save();
        } catch (err) {
          mail.status = 'failed';
          await mail.save();
        }
      }
    }
  } catch (err) { console.error('Cron Error:', err); }
}, 60000);

// --- OTHER ROUTES ---
app.get('/api/email-logs', auth, async (req, res) => {
  const logs = await EmailLog.find({ sentBy: req.userId, isDeleted: false }).sort({ sentAt: -1 }).limit(50);
  res.json(logs);
});

app.get('/api/scheduled-emails', auth, async (req, res) => {
  const scheduled = await ScheduledEmail.find({ sentBy: req.userId, status: 'pending' }).sort({ scheduledAt: 1 });
  res.json(scheduled);
});

app.delete('/api/scheduled-emails/:id', auth, async (req, res) => {
  await ScheduledEmail.findOneAndDelete({ _id: req.params.id, sentBy: req.userId });
  res.json({ message: 'Cancelled' });
});

app.get('/api/auth/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    const logs = await EmailLog.find({ sentBy: req.userId, status: 'success' });
    const totalStorageUsed = logs.reduce((acc, log) => acc + (log.size || 0), 0);

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const sentToday = await EmailLog.countDocuments({
      sentBy: req.userId,
      status: 'success',
      sentAt: { $gte: twentyFourHoursAgo }
    });

    // Debugging logs
    console.log(`Stats for user ${req.userId}: SentToday=${sentToday}, TotalUsed=${totalStorageUsed}`);

    res.json({
      user,
      stats: {
        totalSent: logs.length,
        totalFailed: await EmailLog.countDocuments({ sentBy: req.userId, status: 'failed' }),
        totalTransactions: await EmailLog.countDocuments({ sentBy: req.userId }),
        sentToday,
        totalStorageUsed
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/update-profile', auth, async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findByIdAndUpdate(req.userId, { email }, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/change-password', auth, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.userId);
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Incorrect current password' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/email-stats/daily', auth, async (req, res) => {
  const { period } = req.query;
  let startDate = new Date();
  let format = "%Y-%m-%d";
  if (period === 'day') { startDate.setHours(startDate.getHours() - 24); format = "%H:00"; }
  else if (period === 'month') { startDate.setDate(startDate.getDate() - 30); }
  else { startDate.setDate(startDate.getDate() - 7); }
  const dailyStats = await EmailLog.aggregate([
    { $match: { sentBy: new mongoose.Types.ObjectId(req.userId), sentAt: { $gte: startDate } } },
    { $group: { _id: { $dateToString: { format: format, date: "$sentAt", timezone: "+05:30" } }, success: { $sum: { $cond: [{ $eq: ["$status", "success"] }, 1, 0] } }, failed: { $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] } } } },
    { $sort: { "_id": 1 } }
  ]);
  res.json(dailyStats);
});

app.get('/api/admin/stats/daily', adminAuth, async (req, res) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    const dailyStats = await EmailLog.aggregate([
      { $match: { sentAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$sentAt", timezone: "+05:30" } },
          success: { $sum: { $cond: [{ $eq: ["$status", "success"] }, 1, 0] } },
          failed: { $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] } }
        }
      },
      { $sort: { "_id": 1 } }
    ]);
    res.json(dailyStats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
