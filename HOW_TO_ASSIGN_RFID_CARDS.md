# 📇 How to Assign RFID Cards to Students

## ✅ RFID Tag Field is Now Editable!

I've updated your student profile page so you can easily assign RFID cards.

---

## 🎯 Method 1: Using Admin Dashboard (EASIEST)

### **Step 1: Read Your Card with NFC Tools**

1. **Install NFC Tools** on your Android phone (from Play Store)
2. **Open NFC Tools** app
3. **Tap "READ"** tab
4. **Hold your RFID card** to phone back
5. **Copy the Serial Number**
   - Example from your card: `693BCD860D`
   - Format: Remove colons, uppercase
   - From: `69:3B:CD:86:0D` → To: `693BCD860D`

---

### **Step 2: Assign Card in Dashboard**

1. **Login to your admin dashboard**
   - Go to: `https://your-vercel-app.vercel.app/dashboard`
   - Login with admin credentials

2. **Go to Students page**
   - Click "Students" in sidebar

3. **Find the student**
   - Search or browse for the student

4. **Click on the student**
   - Opens their profile page

5. **Click "Edit" button**
   - Top right of the Overview card

6. **Enter RFID Tag UID**
   - In the "RFID Tag & Location" section
   - Paste the card serial number: `693BCD860D`
   - Format will auto-convert to uppercase
   - Hint text shows: "Use NFC Tools app to read card serial number"

7. **Click "Save"**
   - Changes are saved to database
   - Page will reload showing the new tag ID

---

## 🔢 Card ID Format

**Important:** Use the correct format!

### ✅ **Correct Format:**
```
693BCD860D
```
- Uppercase letters
- No colons or spaces
- No dashes
- 10-14 characters typically

### ❌ **Wrong Formats:**
```
69:3B:CD:86:0D     ← Has colons (remove them)
693bcd860d          ← Lowercase (use uppercase)
69-3B-CD-86-0D     ← Has dashes (remove them)
```

### **How to Format:**
1. Copy from NFC Tools: `69:3B:CD:86:0D`
2. Remove colons: `693BCD860D`
3. Convert to uppercase: `693BCD860D`
4. Paste in field: `693BCD860D`

The input field will automatically convert to uppercase for you!

---

## 📱 Reading Cards with NFC Tools

### **Step-by-Step:**

1. **Open NFC Tools app**
2. **Tap "READ" at bottom**
3. **Hold card to phone back** (near camera)
4. **Wait for data to appear**
5. **Find "Serial number" section**
6. **Long press the serial number**
7. **Tap "Copy"**
8. **Remove colons** before pasting

### **What You'll See:**

```
┌────────────────────────────────┐
│ NFC Tools                       │
├────────────────────────────────┤
│ Tag type: ISO 14443-3A         │
│ NXP - Mifare Classic 1k        │
│                                │
│ 🔑 Serial number               │
│    69:3B:CD:86:0D         ← Copy this
│                                │
│ ATQA: 0x0004                   │
│ SAK: 0x08                      │
└────────────────────────────────┘
```

**Format it:**
- Original: `69:3B:CD:86:0D`
- Remove colons: `693BCD860D`
- Use this: `693BCD860D`

---

## 🎓 Bulk Assignment Process

### **If you have many students:**

1. **Prepare a spreadsheet**
   ```
   Student Name    | Card Serial Number
   ----------------|-------------------
   John Doe        | 693BCD860D
   Jane Smith      | A1B2C3D4E5
   Mike Johnson    | 1234567890AB
   ```

2. **Read all cards with NFC Tools**
   - Read each card
   - Write down or note the serial number
   - Format: remove colons, uppercase

3. **Assign in dashboard**
   - Open each student profile
   - Click Edit
   - Enter RFID Tag UID
   - Save
   - Repeat for all students

4. **Verify assignments**
   - Go to Students list
   - Check "Tag ID" column shows the card numbers

---

## ✅ Verify It Works

### **After assigning cards:**

1. **Check in Students List**
   - Go to Students page
   - See "Tag ID" column shows the card number

2. **Test with Mobile Scanner**
   - Open mobile-rfid page
   - Start scanning
   - Hold the card to phone
   - Should show student name
   - Should log attendance

3. **Check Database (Optional)**
   ```sql
   SELECT student_id, first_name, last_name, rfid_tag_uid
   FROM students
   WHERE rfid_tag_uid IS NOT NULL AND rfid_tag_uid != '';
   ```

---

## 🔍 Common Card Types

Your cards are **ISO 14443-3A (Mifare Classic 1k)**

### **Compatible Card Types:**
- ✅ Mifare Classic 1k (your cards)
- ✅ Mifare Classic 4k
- ✅ Mifare Ultralight
- ✅ NTAG213/215/216
- ✅ Most NFC-A tags

### **Serial Number Length:**
- **4 bytes:** 8 hex characters (e.g., `12345678`)
- **7 bytes:** 14 hex characters (e.g., `1234567890ABCD`)
- **10 bytes:** 20 hex characters

Your card (693BCD860D) is **5 bytes = 10 hex characters**

---

## 🎯 Quick Reference

### **Your Example Card:**

| Property | Value |
|----------|-------|
| **Original from NFC Tools** | 69:3B:CD:86:0D |
| **Formatted for database** | 693BCD860D |
| **Length** | 10 characters |
| **Type** | Mifare Classic 1k |

### **Assignment Steps:**

1. ✅ Read card with NFC Tools
2. ✅ Copy serial number
3. ✅ Remove colons → uppercase
4. ✅ Open student profile in dashboard
5. ✅ Click Edit
6. ✅ Enter RFID Tag UID
7. ✅ Click Save

---

## 🐛 Troubleshooting

### **"Card doesn't scan in mobile app"**

**Check:**
1. Card is assigned in database
2. Format is correct (no colons, uppercase)
3. Student is active
4. API key is correct in mobile app

**Verify:**
```sql
SELECT * FROM students WHERE rfid_tag_uid = '693BCD860D';
```
Should return the student record.

---

### **"Can't read card with NFC Tools"**

**Try:**
1. Enable NFC in phone settings
2. Remove phone case
3. Hold card flat against phone back
4. Try different positions (near camera)
5. Hold steady for 1-2 seconds
6. Make sure card is not damaged

---

### **"Student profile doesn't save"**

**Check:**
1. You're logged in as admin
2. You clicked "Edit" first
3. You clicked "Save" after entering
4. Check browser console for errors (F12)
5. Verify API is working

---

## 📊 Card Management Best Practices

### **1. Keep a Record**
Maintain a spreadsheet:
- Student Name
- Student ID
- Card Serial Number
- Date Assigned
- Card Status (active/lost/damaged)

### **2. Label Cards**
Write student name or ID on card with permanent marker

### **3. Test After Assignment**
Always test with mobile scanner after assigning

### **4. Backup Data**
Export student data regularly with RFID assignments

### **5. Replace Lost Cards**
- Mark old card as inactive in system
- Assign new card serial number
- Update parent notification

---

## 🎉 Summary

### **What Changed:**
✅ RFID Tag UID field is now editable in student profiles  
✅ Auto-converts to uppercase  
✅ Shows helpful hint text  
✅ Saves to database when you click Save  

### **How to Use:**
1. Read card with NFC Tools app
2. Copy serial number (remove colons)
3. Open student profile in dashboard
4. Click Edit → Enter tag UID → Save

### **Your Card:**
- **Original:** 69:3B:CD:86:0D
- **Use:** 693BCD860D

---

**Ready to assign cards! 🎊**

Need help? Check the troubleshooting section above.
