# SafeHer Real SMS & Email Integration

This guide explains how to set up real SMS and email delivery for the SafeHer emergency alert system.

## 🚀 Quick Start

### 1. Configure API Keys

Edit `config/services.env` and add your API keys:

```env
# SMS Service (Twilio)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token  
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Email Service (SendGrid)
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=noreply@safeher.com
FROM_NAME=SafeHer Emergency System
```

### 2. Install and Start Server

```bash
# Install dependencies and start server
node setup-production.js

# Or start manually
npm install dotenv express cors body-parser
node production-server.js
```

### 3. Test the Integration

```bash
# Test server health
curl http://localhost:3001/api/health

# Test SMS and Email services
curl -X POST http://localhost:3001/api/alerts/test-services \
  -H "Content-Type: application/json" \
  -d '{"phone": "+1234567890", "email": "test@example.com"}'
```

## 📱 SMS Setup (Twilio)

### 1. Create Twilio Account
1. Go to [Twilio Console](https://www.twilio.com/console)
2. Sign up for a free trial account
3. Get your Account SID and Auth Token from the dashboard

### 2. Get a Phone Number
1. In Twilio Console, go to "Phone Numbers" > "Buy a Number"
2. Choose a number and purchase it (free trial includes one number)
3. Copy the phone number in E.164 format (+1234567890)

### 3. Configure Environment
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

### 4. Test SMS
```bash
# Send test SMS
curl -X POST http://localhost:3001/api/alerts/send \
  -H "Content-Type: application/json" \
  -d '{
    "guardianId": "test_123",
    "guardianName": "Test User", 
    "guardianPhone": "+1234567890",
    "guardianEmail": "test@example.com",
    "message": "Test SMS from SafeHer",
    "alertType": "test"
  }'
```

## 📧 Email Setup (SendGrid)

### 1. Create SendGrid Account
1. Go to [SendGrid](https://sendgrid.com/)
2. Sign up for a free account (100 emails/day free)
3. Complete sender verification

### 2. Create API Key
1. In SendGrid Dashboard, go to "Settings" > "API Keys"
2. Create new API key with "Mail Send" permissions
3. Copy the API key

### 3. Configure Environment
```env
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
FROM_EMAIL=noreply@safeher.com
FROM_NAME=SafeHer Emergency System
```

### 4. Test Email
```bash
# Send test email
curl -X POST http://localhost:3001/api/alerts/send \
  -H "Content-Type: application/json" \
  -d '{
    "guardianId": "test_123",
    "guardianName": "Test User",
    "guardianPhone": "+1234567890", 
    "guardianEmail": "your-email@example.com",
    "message": "Test email from SafeHer",
    "alertType": "test"
  }'
```

## 🗄️ Database Integration (Supabase)

The system is already configured to work with Supabase. The database schema includes:

- `guardians` table - stores guardian information
- `emergency_alerts` table - stores alert records
- `guardian_notifications` table - tracks notification status

### View Database
```sql
-- View guardians
SELECT * FROM guardians;

-- View recent alerts
SELECT * FROM emergency_alerts ORDER BY created_at DESC;

-- View notification status
SELECT * FROM guardian_notifications ORDER BY sent_at DESC;
```

## 🧪 Testing the Full System

### 1. Start Frontend and Backend
```bash
# Terminal 1: Start backend
node production-server.js

# Terminal 2: Start frontend  
npm run dev
```

### 2. Add Guardians
1. Go to http://localhost:5173/guardian-management
2. Click "Add Guardian"
3. Enter real phone number and email
4. Save guardian

### 3. Send Test Alert
1. Click "Test Alert" on any guardian
2. Watch console for real SMS/Email logs
3. Check your phone for SMS
4. Check your email for alert message

## 🔧 Troubleshooting

### SMS Not Working
- Check Twilio credentials are correct
- Verify phone number is in E.164 format (+country_code + number)
- Ensure Twilio phone number is active
- Check Twilio console for error logs

### Email Not Working  
- Check SendGrid API key is valid
- Verify sender email is authenticated in SendGrid
- Check spam folder for test emails
- Review SendGrid activity logs

### Server Issues
- Ensure all dependencies are installed
- Check port 3001 is not in use
- Verify environment variables are loaded
- Check console for error messages

## 📊 Monitoring

### View Server Status
```bash
curl http://localhost:3001/api/health
```

### View All Alerts
```bash
curl http://localhost:3001/api/alerts
```

### View Specific Alert
```bash
curl http://localhost:3001/api/alerts/{alert_id}
```

## 🔄 Fallback Services

If API keys are not configured, the system automatically uses fallback services:

- **SMS**: TextLocal demo API or simulation (90% success rate)
- **Email**: Mailgun demo API or simulation (95% success rate)

This ensures the system works even without paid API keys.

## 🚨 Production Deployment

For production use:

1. **Use paid API plans** for reliable delivery
2. **Set up proper error handling** and retry logic
3. **Configure monitoring** for delivery status
4. **Use environment variables** for security
5. **Set up proper logging** and alerting

## 📞 Support

- **Twilio Support**: https://www.twilio.com/help
- **SendGrid Support**: https://support.sendgrid.com/
- **SafeHer Documentation**: Check code comments and console logs

## 🔒 Security Notes

- Never commit API keys to version control
- Use environment variables for all secrets
- Implement rate limiting for production
- Validate all input data
- Use HTTPS for all API calls
