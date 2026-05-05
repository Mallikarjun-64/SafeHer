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

### SafeHer - Guardian Angel Alert System

A unified safety platform for women, providing instant emergency alerts, live location tracking, and community-driven protection.

## Core Architecture
- **Frontend**: React + Vite + Tailwind CSS
- **Database/Auth**: Firebase Firestore & Firebase Authentication
- **Backend**: Node.js (Express) for SOS Email Notifications
- **Real-time**: Firestore Snapshots for Live Feed

## Setup Instructions

### 1. Firebase Setup
- Create a Firebase project.
- Enable **Authentication** (Email/Password).
- Enable **Firestore Database**.
- Update `src/lib/firebase.ts` with your config.

### 2. Backend Setup
- Navigate to `server/`.
- Run `npm install`.
- Place your Firebase **serviceAccountKey.json** in the `server/` directory.
- Create a `.env` file in `server/` with:
  ```env
  GMAIL_USER=your-email@gmail.com
  GMAIL_APP_PASSWORD=your-app-password
  FIREBASE_PROJECT_ID=your-project-id
  ```
- Run `npm run dev` to start the backend.

### 3. Frontend Setup
- Navigate to the root directory.
- Run `npm install`.
- Run `npm run dev`.

## Data Model (Firestore)
- `users/{userId}`: User profiles and settings.
- `users/{userId}/guardians`: Sub-collection of trusted contacts.
- `users/{userId}/emergency_alerts`: Sub-collection of SOS events.
- `helplines`: Global collection of emergency numbers.
- `police_stations`: Global collection of police stations.
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
