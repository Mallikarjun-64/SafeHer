# SafeHer Database Setup Instructions

## 🚀 Quick Setup for New Supabase

### **Step 1: Apply Schema**
1. Open your new Supabase dashboard
2. Go to **SQL Editor**
3. Copy entire contents of `complete_schema.sql`
4. Paste and **Run** the script

### **Step 2: Verify Tables**
After running, you should see these tables:
- ✅ `guardians` - Emergency contacts
- ✅ `emergency_alerts` - SOS and emergency notifications
- ✅ `notification_logs` - All notification tracking
- ✅ `user_profiles` - Extended user information

### **Step 3: Test Connection**
Your app should now:
- ✅ Save guardians to database
- ✅ Load guardians from database
- ✅ Send OTP verification emails
- ✅ Delete guardians from database

### **Environment Variables**
Your `.env` already has:
```env
VITE_SUPABASE_URL="https://svzdmiqucqajkwcsdfdu.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
VITE_EMAIL_API_KEY="re_WgkxtuLE_14nDA3m9SnJjc5Ryeur9jYMs"
```

### **Key Features Enabled**
- 🔐 **Row Level Security** - Users only see their own data
- 📧 **Email Verification** - OTP-based guardian confirmation
- 🚨 **Emergency Alerts** - SOS and emergency tracking
- 📊 **Notification Logs** - Complete audit trail
- 👤 **User Profiles** - Extended user information

### **Troubleshooting**
If you get errors:
1. **"column already exists"** - Normal, ignore these
2. **"relation to 'auth.users' does not exist"** - Run schema first
3. **RLS policy errors** - Make sure auth is working

### **Next Steps**
1. Run the `complete_schema.sql` in Supabase
2. Test adding a guardian in the app
3. Verify email verification works
4. Check that guardians appear in database

Your SafeHer app is ready for the new Supabase! 🎉
