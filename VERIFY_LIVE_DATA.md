# ✅ Verify Live MLS Data is Working

## 🔧 What Was Fixed

The chat API was using **hardcoded sample data** instead of calling the live listings API. This has been fixed!

### Before:
```javascript
// Hardcoded sample listings in chat.js
const allListings = [
  { mlsId: "C5123456", title: "Luxury Downtown Toronto Condo", ... }
]
```

### After:
```javascript
// Now calls the listings API which connects to AMPRE
const listingsHandler = (await import('./listings.js')).default;
await listingsHandler(mockReq, mockRes);
listingsData = mockRes.data; // Live MLS data!
```

---

## 🧪 Test It Now

### Step 1: Restart Your Dev Server

**IMPORTANT:** You must restart for the changes to take effect!

```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 2: Clear Browser Cache (Optional but Recommended)

- Press `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
- Or open in incognito/private window

### Step 3: Test the Chat

Go to: `http://localhost:3000`

Ask the avatar:
```
"Show me condos in Toronto"
```

---

## 🔍 How to Verify Live Data

### 1. Check the Console Logs

Open DevTools (F12) → Console tab. You should see:

```
Fetching live MLS listings with params: {location: 'toronto', type: 'condo'}
✅ Live listings fetched: {
  source: 'live_mls',      ← Should say 'live_mls' NOT 'chat_search' or 'fallback'
  count: 30,
  isLive: true,            ← Should be true
  firstListing: 'A00001796' ← Real MLS number, not 'C5123456'
}
```

### 2. Check the MLS Numbers

Look at the property cards. The MLS numbers should be:
- ✅ **Real**: A00001796, W9234567, E8123456, etc.
- ❌ **Fake**: C5123456, W5234567, AP001, AP002

### 3. Check the Addresses

Addresses should be:
- ✅ **Real**: "2144A Queen Street E, Toronto E02, ON M4E 1E3"
- ❌ **Fake**: "88 Blue Jays Way, Toronto, ON" (this was sample data)

### 4. Check the Source Badge

In the UI, look for the source indicator. It should say:
- ✅ **"LIVE MLS DATA"** or **"Live MLS listings from AMPRE"**
- ❌ **"Showing sample listings"**

### 5. Check Images

Property images should:
- ✅ **Load from AMPRE CDN**: URLs like `https://cdn.ampre.ca/...`
- ❌ **Placeholders**: `/avatar-placeholder.png`

---

## 📊 Expected Results

### Test Query: "Show me condos in Toronto"

**Console Output:**
```
Fetching live MLS listings with params: {
  location: "toronto",
  type: "condo",
  search: "Show me condos in Toronto"
}

Fetching from AMPRE API: https://query.ampre.ca/odata/Property?$top=30...
Fetched 30 of 1234 total properties from AMPRE

✅ Live listings fetched: {
  source: "live_mls",
  count: 30,
  isLive: true,
  firstListing: "A00012345"
}

Setting listings: [{id: "E12345", mlsId: "A00012345", ...}, {...}, ...]
Displaying 30 listings from live search
```

**UI Output:**
- 30 property cards appear
- Real MLS numbers shown
- Real Toronto addresses
- Real property photos
- Andrew Pisani contact info on all

**AI Response:**
```
I found 30 condos in Toronto! Here are some great options:

1. MLS# A00012345 - 2-Bedroom Condo Apartment in Toronto at $850,000
2. MLS# W98765432 - Condo Apartment in Toronto at $1,200,000
3. MLS# E12345678 - 1-Bedroom Condo Apartment in Toronto at $650,000

All listings are active and available. Would you like more details on any of these properties? Feel free to call me at 416-882-9304!
```

---

## 🐛 Troubleshooting

### Issue: Still Seeing Sample Data

**Symptoms:**
- MLS numbers like C5123456, AP001, AP002
- Addresses like "88 Blue Jays Way"
- Message says "Showing sample listings"

**Solutions:**

1. **Restart the dev server** (most common fix):
   ```bash
   Ctrl+C
   npm run dev
   ```

2. **Check .env.local** has the token:
   ```bash
   AMPRE_API_TOKEN=eyJhbGciOiJIUzI1NiJ9...
   ```

3. **Clear browser cache**:
   - Hard refresh: Ctrl+Shift+R
   - Or use incognito mode

4. **Check console for errors**:
   - Look for red error messages
   - Check if API is being called

### Issue: Error in Console

**Symptoms:**
```
❌ Could not fetch listings: [error message]
```

**Solutions:**

1. **Check the error message**:
   - "401 Unauthorized" → Token issue
   - "Network error" → API endpoint issue
   - "Import error" → File path issue

2. **Verify token is valid**:
   - Open `.env.local`
   - Check no extra spaces
   - Token should start with "eyJ"

3. **Test API directly**:
   ```
   http://localhost:3000/api/listings?location=toronto&type=condo
   ```
   - Should return live data
   - Check source field

### Issue: No Properties Found

**Symptoms:**
- AI says "No properties found"
- Console shows `count: 0`

**Solutions:**

1. **Try broader search**:
   - "Show me properties in Toronto" (no type filter)
   - "Find houses" (no location filter)

2. **Check filters are working**:
   ```
   http://localhost:3000/api/listings?top=10
   ```
   - Should return 10 properties

3. **Check AMPRE API has data**:
   - Console should show "Fetched X of Y total properties"
   - If Y = 0, AMPRE API might be down

---

## ✅ Verification Checklist

Use this checklist to confirm everything is working:

- [ ] Restarted dev server after code changes
- [ ] Can access `http://localhost:3000`
- [ ] Chat interface loads without errors
- [ ] Asked: "Show me condos in Toronto"
- [ ] Console shows: `source: 'live_mls'`
- [ ] Console shows: `isLive: true`
- [ ] MLS numbers are real (not C5123456, AP001, etc.)
- [ ] Addresses are real Toronto locations
- [ ] Property photos load (not placeholders)
- [ ] Andrew Pisani info shows on all listings
- [ ] No console errors
- [ ] Can click property cards
- [ ] Different searches return different results

---

## 🎯 Quick Tests

### Test 1: Location Filter
```
"Show me condos in Toronto"
```
**Expected:** Toronto condos only, real MLS data

### Test 2: Price Filter
```
"Find houses under $1 million"
```
**Expected:** Houses priced under $1M, real MLS data

### Test 3: Bedroom Filter
```
"3 bedroom homes in Mississauga"
```
**Expected:** 3+ bedroom properties in Mississauga, real MLS data

### Test 4: Combined Filters
```
"2 bedroom condos in Toronto under $800k"
```
**Expected:** Toronto 2-bed condos under $800k, real MLS data

### Test 5: General Search
```
"Show me properties with a view"
```
**Expected:** Properties mentioning "view" in description, real MLS data

---

## 📋 Compare: Sample vs Live Data

### Sample Data (OLD - Should NOT see this):
```json
{
  "mlsId": "C5123456",          ← Fake
  "title": "Luxury Downtown Toronto Condo",
  "address": "88 Blue Jays Way, Toronto, ON",  ← Generic
  "price": 1650000,
  "image": "/avatar-placeholder.png",  ← Placeholder
  "source": "fallback"          ← Not live!
}
```

### Live MLS Data (NEW - Should see this):
```json
{
  "mlsId": "A00001796",         ← Real MLS#
  "title": "2-Bedroom Condo Apartment in Toronto",
  "address": "2144A Queen Street E, Toronto E02, ON M4E 1E3",  ← Specific
  "price": 850000,
  "image": "https://cdn.ampre.ca/photos/...",  ← Real photo
  "source": "ampre_mls"         ← Live!
}
```

---

## 🎉 Success!

You'll know it's working when:

1. **Console says**: `source: 'live_mls'` and `isLive: true`
2. **MLS numbers**: Real numbers like A00012345, W98765432
3. **Addresses**: Specific real addresses with postal codes
4. **Images**: Load from AMPRE CDN
5. **Different results**: Each search returns different properties
6. **No "sample" message**: No mention of fallback/sample data

---

## 📞 Still Having Issues?

### Debug Steps:

1. **Test API endpoint directly**:
   ```
   http://localhost:3000/api/listings?top=5
   ```
   - Check the JSON response
   - Look at the `source` field
   - Should be "live_mls"

2. **Check environment variable**:
   ```bash
   # In terminal (Windows PowerShell):
   cat .env.local
   
   # Should show:
   AMPRE_API_TOKEN=eyJhbGci...
   ```

3. **Check server logs**:
   - Look at terminal where `npm run dev` is running
   - Should see AMPRE API calls
   - No error messages

4. **Test in different browser**:
   - Try Chrome, Firefox, Edge
   - Use incognito/private mode

---

**Last Updated:** October 18, 2025  
**Status:** Chat API now calls live listings API  
**Next Step:** Restart dev server and test!

