# ⚡ Quick Start - Mobile NFC Scanner

Get up and running in 5 minutes!

---

## 🚀 Step 1: Start Backend (1 minute)

```bash
cd c:\Users\johne\OneDrive\Desktop\BACK-END-RFID
npm run dev
```

**Check**: Should show "Server running on port 3001"

---

## 🎨 Step 2: Start Frontend (1 minute)

```bash
cd c:\Users\johne\OneDrive\Desktop\FRONT-END-RFID
npm run dev
```

**Check**: Should show "Ready on http://localhost:3000"

---

## 🔒 Step 3: Get Your API Key (30 seconds)

Open `c:\Users\johne\OneDrive\Desktop\BACK-END-RFID\.env`

Find this line:
```
API_KEY=your_rfid_device_api_key_here
```

**Copy the value** (the part after `API_KEY=`)

---

## 📱 Step 4: Setup HTTPS for Phone Testing (2 minutes)

**Install ngrok** (one-time setup):
- Download from: https://ngrok.com/download
- Extract and add to PATH

**Expose Frontend:**
```bash
# In a new terminal:
ngrok http 3000
```

You'll see something like:
```
Forwarding  https://abc123.ngrok-free.app -> http://localhost:3000
```

**Copy the HTTPS URL** (the `https://abc123.ngrok-free.app` part)

**Expose Backend:**
```bash
# In another new terminal:
ngrok http 3001
```

Copy this HTTPS URL too.

---

## 🔧 Step 5: Configure Frontend (30 seconds)

Create `c:\Users\johne\OneDrive\Desktop\FRONT-END-RFID\.env.local`:

```env
NEXT_PUBLIC_API_URL=https://your-backend-ngrok-url.ngrok-free.app
```

**Restart frontend** (Ctrl+C and `npm run dev` again)

---

## 📱 Step 6: Test on Your Phone (1 minute)

1. **Open Chrome** on your Android phone
2. **Enable NFC** in phone settings
3. **Visit**: `https://your-frontend-ngrok-url.ngrok-free.app/mobile-rfid`
4. **Tap ⚙️** (settings icon)
5. **Paste your API key** from Step 3
6. **Tap "Save API Key"**

---

## 🎴 Step 7: Scan Your Card! (30 seconds)

1. **Tap "🎯 Start Scanning"**
2. **Allow NFC permissions** when prompted
3. **Hold your RFID card** (691BCD860D) to phone back
4. **Wait for confirmation!**

---

## ✅ Success!

You should see:
- ✅ Card ID detected
- ✅ Student name displayed
- ✅ Action (ENTRY/EXIT)
- ✅ Timestamp
- ✅ Phone vibrates

---

## 🐛 Quick Troubleshooting

### "Web NFC not supported"
- Make sure you're using the **HTTPS ngrok URL**
- Not the localhost URL

### "Unauthorized"
- Check API key is correct
- Make sure backend ngrok URL is in .env.local

### Card not detected
- Enable NFC in phone settings
- Hold card to phone back (near camera)
- Try different positions

---

## 📝 Next Steps

Once testing works:

1. **Register your card** in database:
   ```sql
   UPDATE students 
   SET rfid_tag_uid = '691BCD860D' 
   WHERE student_id = YOUR_STUDENT_ID;
   ```

2. **Deploy to production** (see MOBILE_NFC_GUIDE.md)

3. **Install as PWA** on phone home screen

4. **Start logging attendance!** 🎉

---

## 💡 Pro Tips

- **Keep ngrok terminal running** while testing
- **Free ngrok** has 2-hour session limit - restart when needed
- **For production**, deploy to Vercel/Netlify (automatic HTTPS)
- **Add PWA icons** for better home screen experience

---

**You're all set! Happy scanning!** 📱✨
