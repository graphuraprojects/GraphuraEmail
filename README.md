# MERN ZeptoMail Integration

A professional MERN stack application to send bulk emails using Zoho ZeptoMail API.

## Features
- **Send Bulk Emails**: Enter multiple recipients separated by commas or spaces.
- **HTML Support**: Send rich HTML content in your emails.
- **Live Logs**: View history of sent emails with status (Success/Failed).
- **Premium UI**: Modern, responsive dark-themed dashboard.
- **MongoDB Logging**: All transactions are logged for tracking.

## Getting Started

### 1. Prerequisites
- Node.js installed
- MongoDB running locally (or update URI in `.env`)
- Zoho ZeptoMail Account & API Key

### 2. Configuration
Open `backend/.env` and update the following:
```env
ZEPTOMAIL_API_KEY=your_actual_key_here
ZEPTOMAIL_SENDER_EMAIL=authorized_sender@yourdomain.com
ZEPTOMAIL_SENDER_NAME=Your Brand Name
```

### 3. Run the Backend
```bash
cd backend
npm start
```

### 4. Run the Frontend
```bash
cd frontend
npm run dev
```

## Tech Stack
- **Frontend**: React, Vite, Lucide-React, Axios, Vanilla CSS (Modern Glassmorphism)
- **Backend**: Node.js, Express, ZeptoMail SDK, Mongoose
- **Database**: MongoDB
