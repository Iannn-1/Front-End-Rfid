# ✅ Mobile NFC Scanner - Testing Checklist

## 🎯 Pre-Deployment Testing

### Backend Testing

#### 1. Environment Variables
```bash
cd c:\Users\johne\OneDrive\Desktop\BACK-END-RFID
```

Check `.env` file has:
- [ ] `API_KEY` is set (remember this value!)
- [ ] `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` are correct
- [ ] `JWT_SECRET` is set
- [ ] `PORT=3001` (or your preferred port)

#### 2. Start Backend
```bash
npm run dev
```

- [ ] Server starts without errors
- [ ] Shows "Server running on port 3001" (or your port)
- [ ] Database connection successful

#### 3. Test RFID Endpoint Manually
```bash
# Windows CMD:
curl -X POST http://localhost:3001/api/v1/rfid/scan -H "Content-Type: application/json" -H "X-API-Key: YOUR_API_KEY_HERE" -d "{\"rfid_tag_uid\":\"691BCD860D\"}"
```

Expected responses:
- [ ] With wrong API key: `{"success":false,"error":"Unauthorized"}`
- [ ] With correct key but unknown card: Error about student not found
- [ ] With correct key and registered card: Success with student data

---

### Frontend Testing

#### 1. Environment Variables
```bash
cd c:\Users\johne\OneDrive\Desktop\FRONT-END-RFID
```

Create/update `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

#### 2. Start Frontend
```bash
npm run dev
```

- [ ] Server starts without errors
- [ ] Shows "Ready on http://localhost:3000"

#### 3. Test Mobile Page (Desktop Browser First)
1. Open: http://localhost:3000/mobile-rfid
2. Check:
   - [ ] Page loads correctly
   - [ ] Shows "Web NFC not supported" (on desktop - this is expected)
   - [ ] Settings icon visible
   - [ ] Can enter API key
   - [ ] Styling looks good

---

## 📱 Phone Testing (Local Network)

### 1. Find Your Computer's Local IP

**Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" under your active network adapter (e.g., `192.168.1.100`)

### 2. Update Backend CORS

Edit `c:\Users\johne\OneDrive\Desktop\BACK-END-RFID\src\app.ts` and add:
```typescript
app.use(cors({
  origin: '*', // For testing only! Change in production
  credentials: true
}));
```

Restart backend.

### 3. Test from Phone

1. **Connect phone to same WiFi** as your computer
2. **Open Chrome** on Android phone
3. **Visit**: `http://YOUR_COMPUTER_IP:3000/mobile-rfid`
   - Example: `http://192.168.1.100:3000/mobile-rfid`
4. Check:
   - [ ] Page loads
   - [ ] Still shows "Web NFC not supported" (HTTP not secure)

### 4. Enable HTTPS for Local Testing

**Option A: Use ngrok (Easiest)**
```bash
# Install ngrok: https://ngrok.com/download
# In frontend directory:
npm run dev

# In another terminal:
ngrok http 3000
```
- [ ] Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)
- [ ] Also expose backend:
```bash
ngrok http 3001
```
- [ ] Update frontend `.env.local` with ngrok backend URL
- [ ] Restart frontend

**Option B: Use localtunnel**
```bash
npm install -g localtunnel
lt --port 3000
```

### 5. Test with HTTPS URL

1. **Open**: `https://your-ngrok-url.ngrok.io/mobile-rfid`
2. Check:
   - [ ] Page loads with HTTPS
   - [ ] Shows "NFC Ready!" message
   - [ ] No more "not supported" error

---

## 🎴 NFC Card Testing

### 1. Prepare Test Student

In your database, create/update a student with your card ID:
```sql
UPDATE students 
SET rfid_tag_uid = '691BCD860D' 
WHERE student_id = 1;
-- Or insert new student with this RFID
```

- [ ] Student exists with `rfid_tag_uid = '691BCD860D'`
- [ ] Student has first_name, last_name set

### 2. Configure App

1. Open mobile-rfid page on phone
2. Tap ⚙️ Settings
3. Enter API key from backend .env
4. Tap "Save API Key"
5. Check:
   - [ ] Shows "API Key saved!"
   - [ ] Settings close automatically

### 3. First NFC Scan

1. Tap "🎯 Start Scanning"
2. When prompted:
   - [ ] Allow NFC permissions
3. Check status:
   - [ ] Shows "Scanning active! Tap your card now..."
4. Hold your RFID card to phone back (near camera):
   - [ ] Phone vibrates
   - [ ] Shows "Card detected: 691BCD860D"
   - [ ] Shows "Processing..."
   - [ ] Shows success message with student name
   - [ ] Shows action (ENTRY or EXIT)
   - [ ] Shows timestamp

### 4. Verify Backend

Check backend console:
- [ ] Shows log of RFID scan request
- [ ] No errors

Check database:
```sql
SELECT * FROM attendance_logs 
WHERE rfid_tag_uid = '691BCD860D' 
ORDER BY timestamp DESC 
LIMIT 5;
```
- [ ] New attendance log created
- [ ] Action is 'entry' or 'exit' (alternating)
- [ ] Timestamp is correct

### 5. Test Multiple Scans

1. Scan card again:
   - [ ] Alternates between ENTRY and EXIT
   - [ ] Each scan creates new log
   - [ ] Recent logs section shows last scans
   - [ ] Timestamps are accurate

### 6. Test Error Cases

**Unknown Card:**
- Use different RFID card or modify card ID manually in browser console
- [ ] Shows error message
- [ ] Phone vibrates with error pattern
- [ ] No log created

**Wrong API Key:**
- Change API key in settings to wrong value
- [ ] Shows "Unauthorized" error

**Backend Down:**
- Stop backend server
- [ ] Shows "Failed to connect to server"

---

## 🚀 Production Deployment Testing

### 1. Deploy Backend

**Railway/Render/Heroku:**
- [ ] Environment variables configured
- [ ] Database connected
- [ ] HTTPS enabled
- [ ] API_KEY set securely
- [ ] CORS configured for frontend domain

Test deployment:
```bash
curl https://your-backend-url.com/api/v1/rfid/scan \
  -X POST \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_API_KEY" \
  -d '{"rfid_tag_uid":"691BCD860D"}'
```

### 2. Deploy Frontend

**Vercel/Netlify:**
```bash
cd c:\Users\johne\OneDrive\Desktop\FRONT-END-RFID

# For Vercel:
vercel --prod

# Or push to GitHub and connect to Vercel
```

- [ ] Deployed successfully
- [ ] HTTPS enabled automatically
- [ ] Environment variable `NEXT_PUBLIC_API_URL` set to production backend
- [ ] Can access `/mobile-rfid` route

### 3. Production NFC Testing

1. Open production URL on phone: `https://your-app.vercel.app/mobile-rfid`
2. Check:
   - [ ] HTTPS lock icon visible
   - [ ] Shows "NFC Ready!"
   - [ ] Can configure API key
   - [ ] Can scan cards successfully
   - [ ] Logs are saved

### 4. PWA Installation

1. On phone, visit mobile-rfid page
2. Chrome menu (⋮) → "Install app" or "Add to Home Screen"
3. Check:
   - [ ] Installation prompt appears
   - [ ] Icon shows on home screen
   - [ ] Launches in standalone mode
   - [ ] NFC still works in installed app

---

## 🔒 Security Testing

- [ ] API key required for all requests
- [ ] Wrong API key returns 401 Unauthorized
- [ ] HTTPS enforced (no HTTP access)
- [ ] CORS configured correctly
- [ ] API key not exposed in frontend code
- [ ] API key stored securely in localStorage
- [ ] No sensitive data in console logs

---

## 📊 Performance Testing

- [ ] Page loads in < 2 seconds
- [ ] Card scan takes < 1 second
- [ ] Recent logs load instantly
- [ ] No memory leaks after multiple scans
- [ ] Works offline (cached pages)
- [ ] Responsive on different screen sizes

---

## 🐛 Common Issues & Solutions

### "Web NFC not supported"
- ✅ Use HTTPS (not HTTP)
- ✅ Use Chrome on Android
- ✅ Update Chrome to latest version

### "NFC permission denied"
- ✅ Enable NFC in phone settings
- ✅ Reload page and allow permissions

### Card not detected
- ✅ Hold card closer to phone back
- ✅ Try different positions
- ✅ Remove thick phone case

### "Unauthorized" error
- ✅ Check API key matches backend
- ✅ Verify backend .env has API_KEY set

### "Failed to connect"
- ✅ Check backend is running
- ✅ Verify NEXT_PUBLIC_API_URL is correct
- ✅ Check CORS configuration

---

## ✅ Final Go-Live Checklist

### Backend
- [ ] Deployed to production server
- [ ] Database connected and seeded
- [ ] All students have RFID tags assigned
- [ ] Email notifications configured (if enabled)
- [ ] API_KEY is strong and secure
- [ ] CORS configured for frontend domain only
- [ ] Health check endpoint responding

### Frontend
- [ ] Deployed with HTTPS
- [ ] PWA manifest configured
- [ ] Icons generated (192x192 and 512x512)
- [ ] Service worker registered
- [ ] Environment variables set
- [ ] Mobile-responsive
- [ ] Tested on multiple Android devices

### Testing
- [ ] All test cases passed
- [ ] Multiple card types tested
- [ ] Concurrent scans handled correctly
- [ ] Error cases handled gracefully
- [ ] Performance acceptable
- [ ] Security verified

### Documentation
- [ ] Admin trained on system
- [ ] User guide provided
- [ ] Troubleshooting guide available
- [ ] API documentation complete

---

## 🎉 Success Criteria

Your system is ready when:
1. ✅ You can scan RFID cards with phone
2. ✅ Attendance logs are created correctly
3. ✅ Entry/Exit alternates properly
4. ✅ Recent logs display accurately
5. ✅ Works reliably on school network
6. ✅ PWA installed on guard's phone
7. ✅ Email notifications work (if enabled)
8. ✅ Admin can view reports
9. ✅ Parents receive notifications (if enabled)

**You're ready to go live!** 🚀
