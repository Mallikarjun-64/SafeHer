# SafeHer: Guardian Angel Alert System

SafeHer is a comprehensive women's safety application designed to provide instant emergency assistance. It features a powerful SOS system that notifies guardians via real-time email alerts and provides live GPS tracking.

## 🚀 Key Features

- **One-Tap SOS**: Instantly triggers an emergency alert.
- **Guardian Management**: Add and manage emergency contacts who will be notified during an SOS event.
- **Email Alerts**: Automated emergency emails sent to guardians via Nodemailer and Gmail.
- **Live Location Tracking**: Share your precise GPS location with guardians in real-time.
- **Firebase Integration**: Secure authentication and cloud data persistence using Firebase Auth and Firestore.
- **Responsive Dashboard**: Dedicated views for Users, Guardians, and Emergency Services.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Shadcn UI, Lucide Icons.
- **Backend**: Node.js, Express.
- **Database & Auth**: Firebase (Authentication & Cloud Firestore).
- **Notifications**: Nodemailer (Gmail API).

## 📋 Setup Instructions

### 1. Prerequisites
- Node.js (v18+)
- A Firebase Project
- A Gmail account with 2-Step Verification enabled

### 2. Frontend Configuration
Create a `.env` file in the root directory:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. Backend Configuration
Navigate to the `server` directory and create a `.env` file:
```env
PORT=3001
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-char-app-password
FIREBASE_PROJECT_ID=your-project-id
```

**Service Account Setup:**
1.  Go to Firebase Console -> Project Settings -> Service Accounts.
2.  Generate a new private key (JSON).
3.  Rename it to `serviceAccountKey.json` and place it inside the `server` folder.

### 4. Installation & Running
From the root directory:
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd server && npm install

# Start both servers
cd ..
node scripts/start-servers.js
```

## 🛡️ Security Note
- Never commit your `.env` or `serviceAccountKey.json` files. They are already added to `.gitignore`.
- Use **Gmail App Passwords** instead of your primary password for the backend email service.

---
**SafeHer** - *Your safety, our priority.*
